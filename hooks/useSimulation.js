// Central live-simulation hook — all components subscribe to this single source of truth.
function useSimulation() {
  const { useState, useRef, useEffect, useCallback } = React;

  const [kpis, setKpis] = useState(SEED_KPIS);
  const [activityStream, setActivityStream] = useState(SEED_ACTIVITY);
  const [threatFeed, setThreatFeed] = useState(SEED_THREAT_FEED);
  const [mapDots, setMapDots] = useState(SEED_MAP_DOTS);
  const [unknownLog, setUnknownLog] = useState(SEED_UNKNOWN_LOG);

  // counters used to drive pattern-detection observations
  const counters = useRef({
    resolvedByType: {},
    last10ByType: {},
    totalCalls: 0,
    unknownCalls: 0,
    compliedTotal: 0,
    decidedTotal: 0,
    successRateAlerted: {},
  });

  const pushActivity = useCallback((type, region, scamType, userId) => {
    setActivityStream(prev => [buildActivityEvent(type, region, scamType, userId), ...prev].slice(0, 60));
  }, []);

  const pushThreat = useCallback((severity, text) => {
    setThreatFeed(prev => [{
      id: genId('TI'),
      timestamp: Date.now(),
      severity,
      text,
    }, ...prev].slice(0, 20));
  }, []);

  const updateMapDot = useCallback((id, status) => {
    setMapDots(prev => prev.map(d => d.id === id ? { ...d, status } : d));
  }, []);

  const addMapDot = useCallback((dot) => {
    setMapDots(prev => [...prev, dot].slice(-30));
  }, []);

  const checkPatterns = useCallback((scamType, region, outcome) => {
    const c = counters.current;
    c.totalCalls += 1;
    if (outcome === 'unknown') c.unknownCalls += 1;
    if (outcome !== 'unknown') {
      c.decidedTotal += 1;
      if (outcome === 'complied') c.compliedTotal += 1;
    }

    // resolved-of-type counter -> spike observations every 4 calls of same type
    c.resolvedByType[scamType] = (c.resolvedByType[scamType] || 0) + 1;
    if (c.resolvedByType[scamType] % 4 === 0) {
      if (scamType === 'Tech Support Fraud') {
        pushThreat('High', `Spike in Tech Support Fraud calls — ${c.resolvedByType[scamType]} attempts in the last hour, latest cluster near ${region.name}. Possible coordinated campaign.`);
      } else {
        pushThreat('Medium', `${scamType} call volume rising — ${c.resolvedByType[scamType]} attempts logged today, latest near ${region.name}. Pattern logged.`);
      }
    }

    // last-10 success rate per scam type
    if (outcome !== 'unknown') {
      const arr = c.last10ByType[scamType] || [];
      arr.push(outcome === 'complied' ? 1 : 0);
      if (arr.length > 10) arr.shift();
      c.last10ByType[scamType] = arr;
      if (arr.length >= 10) {
        const rate = arr.reduce((a, b) => a + b, 0) / arr.length;
        if (rate < 0.6 && !c.successRateAlerted[scamType]) {
          pushThreat('Medium', `Mimi intervention success rate dropped to ${Math.round(rate * 100)}% against ${scamType} calls in the last 10 attempts. Monitoring for script evolution.`);
          c.successRateAlerted[scamType] = true;
          c.last10ByType[scamType] = arr.slice(-5);
        } else if (rate >= 0.6) {
          c.successRateAlerted[scamType] = false;
        }
      }
    }

    // unknown classification rate
    if (c.totalCalls >= 10) {
      const rate = c.unknownCalls / c.totalCalls;
      if (rate > 0.15 && !c.unknownAlerted) {
        pushThreat('Low', `Unknown classification rate is ${Math.round(rate * 100)}% this session vs ${Math.round((SCAM_BREAKDOWN.today.reduce((a,b)=>a+b,0) ? 9 : 9))}% 7-day average. May indicate a new scam script in circulation.`);
        c.unknownAlerted = true;
      }
    }
  }, [pushThreat]);

  const runCallLifecycle = useCallback(() => {
    const region = rand(REGIONS);
    const scamType = weightedPick(SCAM_WEIGHTS);
    const userId = genUserId();
    const callId = genId('CALL');

    pushActivity('call_started', region, scamType, userId);
    addMapDot({
      id: callId,
      region: region.name,
      x: region.x + (Math.random() * 4 - 2),
      y: region.y + (Math.random() * 4 - 2),
      lat: region.lat + (Math.random() * 1.2 - 0.6),
      lng: region.lng + (Math.random() * 1.2 - 0.6),
      status: 'active',
      scamType,
    });
    setKpis(prev => ({ ...prev, activeEscalations: prev.activeEscalations + 1 }));

    // Observe -> Orient: scam detected after 5-10s
    const t1 = 5000 + Math.random() * 5000;
    setTimeout(() => {
      pushActivity('scam_detected', region, scamType, userId);

      // Decide -> Act: Mimi intervenes after 3-5s
      const t2 = 3000 + Math.random() * 2000;
      setTimeout(() => {
        pushActivity('mimi_intervened', region, scamType, userId);

        const outcome = weightedPick(OUTCOME_WEIGHTS);
        const t3 = 2000 + Math.random() * 3000;
        setTimeout(() => {
          if (outcome === 'complied') {
            pushActivity('user_complied', region, scamType, userId);
            pushActivity('call_ended', region, scamType, userId);
            updateMapDot(callId, 'resolved');
            setKpis(prev => {
              const saved = prev.moneySaved + (LOSS_LOOKUP[scamType] || 0);
              const resolved = prev.mimiResolved + 1;
              const decided = (counters.current.decidedTotal || 0) + 1;
              const complied = (counters.current.compliedTotal || 0) + 1;
              const rate = Math.round((complied / decided) * 100);
              return {
                ...prev,
                mimiResolved: resolved,
                mimiResolvedSpark: [...prev.mimiResolvedSpark.slice(1), resolved],
                activeEscalations: Math.max(0, prev.activeEscalations - 1),
                moneySaved: saved,
                interventionRate: rate,
                interventionRateDelta: rate - prev.interventionRatePrevAvg,
              };
            });
          } else if (outcome === 'ignored') {
            pushActivity('user_ignored', region, scamType, userId);
            updateMapDot(callId, 'ignored');
            setKpis(prev => {
              const atRisk = prev.moneyAtRisk + (LOSS_LOOKUP[scamType] || 0);
              const decided = (counters.current.decidedTotal || 0) + 1;
              const complied = (counters.current.compliedTotal || 0);
              const rate = Math.round((complied / decided) * 100);
              return {
                ...prev,
                moneyAtRisk: atRisk,
                interventionRate: rate,
                interventionRateDelta: rate - prev.interventionRatePrevAvg,
              };
            });
          } else {
            pushActivity('classification_unknown', region, scamType, userId);
            pushActivity('call_ended', region, scamType, userId);
            updateMapDot(callId, 'resolved');
            setKpis(prev => ({ ...prev, activeEscalations: Math.max(0, prev.activeEscalations - 1) }));
            setUnknownLog(prev => [{
              id: genId('UNK'),
              time: Date.now(),
              duration: `${1 + Math.floor(Math.random() * 4)}m ${Math.floor(Math.random() * 60)}s`,
              region: region.name,
              riskScore: 40 + Math.floor(Math.random() * 40),
              transcript: '...transcript pending review...',
            }, ...prev].slice(0, 30));
          }
          checkPatterns(scamType, region, outcome);
        }, t3);
      }, t2);
    }, t1);
  }, [pushActivity, addMapDot, updateMapDot, checkPatterns]);

  useEffect(() => {
    let cancelled = false;
    const schedule = () => {
      const delay = 3000 + Math.random() * 17000;
      const id = setTimeout(() => {
        if (cancelled) return;
        runCallLifecycle();
        schedule();
      }, delay);
      return id;
    };
    const timeoutId = schedule();
    return () => { cancelled = true; clearTimeout(timeoutId); };
  }, [runCallLifecycle]);

  return { kpis, activityStream, threatFeed, mapDots, unknownLog, setUnknownLog };
}
