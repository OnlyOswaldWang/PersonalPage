function initialiseClinicalStudy(container) {
  const root = container.querySelector('.clinical-study');
  if (!root) return;
  const abort = new AbortController();
  const workspace = root.querySelector('.study-workspace');
  const tabs = [...root.querySelectorAll('[data-study-tab]')];
  const state = { panel: 'overview', split: 'test', task: 'A', metric: 'auprc', model: 'MTL-Transformer', trainingTask: 'A', thresholdTask: 'A' };
  const tasks = {
    A: { name: 'In-hospital mortality', short: 'In-hospital mortality', primary: 'auprc', description: 'Binary prediction of death during the hospital admission.' },
    B: { name: 'Mortality during ICU hours 24–48', short: '24–48 h mortality', primary: 'auprc', description: 'Use the first 24 hours of observations to predict mortality during the following 24-hour window.' },
    C: { name: 'ICU length-of-stay classification', short: 'ICU length of stay', primary: 'macro_f1', description: 'Three classes: less than 3 days, 3–7 days, and more than 7 days.' }
  };
  const metricNames = { accuracy: 'Accuracy', precision: 'Precision', recall: 'Recall', f1: 'F1', auroc: 'AUROC', auprc: 'AUPRC', macro_f1: 'Macro-F1', weighted_f1: 'Weighted F1', balanced_acc: 'Balanced accuracy', auroc_ovr: 'OvR-AUROC' };
  const colours = ['#355e83', '#ac6a35', '#668879', '#8993a5'];
  const esc = value => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const fmt = value => Number.isFinite(value) ? value.toFixed(4) : '—';
  const pct = value => (100 * value).toFixed(2) + '%';
  const count = value => Number(value).toLocaleString('en-GB');
  let data;
  const sizeToolbar = () => root.style.setProperty('--study-toolbar-height', `${container.closest('dialog').querySelector('.dialog-toolbar').offsetHeight}px`);
  sizeToolbar();
  window.addEventListener('resize', sizeToolbar);

  function select(label, key, options, value) {
    return `<label class="study-select"><span>${esc(label)}</span><select aria-label="${esc(label)}" data-study-control="${key}">${options.map(([v, t]) => `<option value="${esc(v)}"${v === value ? ' selected' : ''}>${esc(t)}</option>`).join('')}</select></label>`;
  }
  function legend(items) {
    return `<div class="study-legend">${items.map((s, i) => `<span><i style="background:${colours[i % colours.length]}"></i>${esc(s.name)}</span>`).join('')}</div>`;
  }
  function barChart(rows, title) {
    const left = 156, plot = 480, top = 26, rowHeight = 45, bottom = top + rows.length * rowHeight;
    const mobile = `<div class="study-mobile-bars" role="img" aria-label="${esc(title)}">${rows.map((r, i) => `<div><span>${esc(r.name)}</span><strong>${fmt(r.value)}</strong><div><i style="width:${r.value * 100}%;background:${r.colour || colours[i % colours.length]}"></i></div></div>`).join('')}<small>Metric scale: 0–1</small></div>`;
    return `${mobile}<svg class="study-chart study-bar-chart" viewBox="0 0 710 ${bottom + 38}" role="img" aria-label="${esc(title)}"><title>${esc(title)}</title>${[0, .25, .5, .75, 1].map(t => `<path class="chart-grid" d="M${left + t * plot} ${top - 10}V${bottom}"/><text class="chart-tick" x="${left + t * plot}" y="${bottom + 23}" text-anchor="middle">${t}</text>`).join('')}${rows.map((r, i) => `<text class="chart-label" x="${left - 12}" y="${top + i * rowHeight + 17}" text-anchor="end">${esc(r.name)}</text><rect x="${left}" y="${top + i * rowHeight}" width="${Math.max(0, r.value * plot)}" height="25" rx="2" fill="${r.colour || colours[i % colours.length]}"><title>${esc(r.name)}: ${fmt(r.value)}</title></rect><text class="chart-value" x="${left + r.value * plot + 8}" y="${top + i * rowHeight + 17}">${fmt(r.value)}</text>`).join('')}</svg>`;
  }
  function lineChart(series, title, unitScale) {
    const points = series.flatMap(s => s.points).filter(p => Number.isFinite(p.y));
    if (!points.length) return '<p>No archived points are available.</p>';
    const left = 49, right = 659, top = 20, bottom = 222;
    const maxEpoch = Math.max(...points.map(p => p.x), 2);
    const maxY = unitScale ? 1 : Math.ceil(Math.max(...points.map(p => p.y)) * 1.08 * 2) / 2;
    const x = n => left + (n - 1) / (maxEpoch - 1) * (right - left);
    const y = n => bottom - n / maxY * (bottom - top);
    const ticks = [1, Math.round(maxEpoch / 2), maxEpoch].filter((v, i, a) => a.indexOf(v) === i);
    return `<div class="study-line-scroll" tabindex="0" aria-label="Scrollable training chart"><svg class="study-chart" viewBox="0 0 690 265" role="img" aria-label="${esc(title)}"><title>${esc(title)}</title>${[0, .25, .5, .75, 1].map(t => `<path class="chart-grid" d="M${left} ${y(t * maxY)}H${right}"/><text class="chart-tick" x="${left - 9}" y="${y(t * maxY) + 4}" text-anchor="end">${(t * maxY).toFixed(2)}</text>`).join('')}${ticks.map(t => `<text class="chart-tick" x="${x(t)}" y="242" text-anchor="middle">${t}</text>`).join('')}<text class="chart-tick" x="355" y="261" text-anchor="middle">Epoch</text>${series.map((s, i) => `<polyline fill="none" stroke="${colours[i % colours.length]}" stroke-width="2.3" points="${s.points.filter(p => Number.isFinite(p.y)).map(p => `${x(p.x)},${y(p.y)}`).join(' ')}"><title>${esc(s.name)}</title></polyline>`).join('')}</svg></div>${legend(series)}`;
  }
  function overview() {
    return `<div class="study-section-heading"><span>01 / RESEARCH QUESTION</span><h3>Can related outcomes benefit from a shared temporal representation?</h3><p>The study compares sequential and multi-task approaches, then adds static context through a separate feature encoder.</p></div><div class="study-task-cards">${Object.entries(tasks).map(([key, t]) => `<article><span>TASK ${key}</span><h4>${t.name}</h4><p>${t.description}</p><small>Primary metric: ${metricNames[t.primary]}</small></article>`).join('')}</div><figure class="clinical-architecture"><img src="assets/clinical-model-overview.svg" alt="Transformer and static-feature encoders feed a concatenated representation and three task-specific heads"><figcaption>Fusion architecture redrawn from the <a href="https://github.com/OnlyOswaldWang/Data-Science/blob/main/src/models/step20_mtl_transformer_fusion.py" target="_blank" rel="noopener">PyTorch implementation ↗</a>.</figcaption></figure><h3>The experimental route</h3><ol class="study-route"><li><strong>Build the cohort</strong><span>Define three labels and train, validation and test partitions.</span></li><li><strong>Represent the first 24 hours</strong><span>Aggregate hourly variables and preserve missingness indicators.</span></li><li><strong>Compare model families</strong><span>Tabular LR / XGBoost, then LSTM, Transformer and shared multi-task learning.</span></li><li><strong>Fuse static context</strong><span>Combine temporal and static representations before task-specific heads.</span></li><li><strong>Analyse decision thresholds</strong><span>Evaluate the precision–recall trade-off with validation-selected thresholds.</span></li></ol><div class="study-takeaway"><strong>A task-dependent result</strong><p>Fusion has the highest reported mortality AUPRC among the four sequential model families shown here. LSTM retains the highest length-of-stay Macro-F1. Shared learning does not improve every outcome equally.</p></div>`;
  }
  function cohort() {
    const q = data.quality.find(r => r.split === state.split);
    const names = { train: 'Training', val: 'Validation', test: 'Test' };
    const selectedN = data.splits.find(r => r.split === state.split).n;
    return `<div class="study-section-heading"><span>02 / COHORT & INPUT DESIGN</span><h3>A fixed observation window, with missingness retained</h3><p>32,551 ICU-stay samples are recorded in the split summaries. These counts describe stays, not a claim about unique patients.</p></div><div class="study-split-bar" aria-label="Approximately 70 percent training, 15 percent validation, 15 percent test">${data.splits.map((s, i) => `<span style="width:${s.ratio * 100}%;background:${colours[i]}">${Math.round(100 * s.ratio)}%</span>`).join('')}</div><div class="study-split-labels">${data.splits.map((s, i) => `<div><i style="background:${colours[i]}"></i><span>${names[s.split]}<strong>${count(s.n)}</strong></span></div>`).join('')}</div><div class="study-controls">${select('Data partition', 'split', Object.entries(names), state.split)}</div><div class="study-kpis"><div><span>Selected partition</span><strong>${count(selectedN)}</strong><small>ICU-stay samples</small></div><div><span>Missing input cells</span><strong>${pct(q.missing_rate)}</strong><small>Hourly variable cells before filling</small></div><div><span>No observed sequence cells</span><strong>${count(q.all_zero_samples)}</strong><small>Samples with an all-zero sequence mask</small></div></div><h3>Outcome distribution</h3><div class="study-distributions">${Object.entries(tasks).map(([task, t]) => { const rows = data.labels.filter(r => r.split === state.split && r.task === task); return `<article><h4>${t.short}</h4>${rows.map(r => { const label = task === 'C' ? ['<3 days', '3–7 days', '>7 days'][r.label] : ['Negative', 'Positive'][r.label]; return `<div class="study-distribution-row"><span>${esc(label)}</span><strong>${pct(r.ratio)}</strong><div><i style="width:${r.ratio * 100}%;background:${colours[r.label]}"></i></div><small>${count(r.count)} stays</small></div>`; }).join('')}</article>`; }).join('')}</div><div class="study-takeaway"><strong>Why accuracy alone is insufficient</strong><p>The short-window mortality task has a positive rate of about 1.5%. AUPRC, recall and F1 help describe minority-class performance; accuracy can be dominated by the negative class.</p></div><h3>The sequence representation</h3><p>Each sample contains 24 hourly bins across heart rate, systolic / diastolic / mean blood pressure, respiratory rate, temperature, oxygen saturation, glucose, creatinine, white-cell count, haemoglobin and platelets.</p><p>Within-hour observations are averaged. Missing values are zero-filled, with an explicit observed/missing indicator supplied alongside the measurements. Static features form a separate input branch in the Fusion model.</p><p class="study-source-note">Source: archived split, label-distribution and sequence-input-check summaries. No patient-level records are included in this page.</p>`;
  }
  function resultMetrics() { return state.task === 'C' ? ['macro_f1', 'balanced_acc', 'accuracy', 'weighted_f1', 'auroc_ovr'] : ['auprc', 'auroc', 'f1', 'precision', 'recall', 'accuracy']; }
  function results() {
    const allowed = resultMetrics();
    if (!allowed.includes(state.metric)) state.metric = tasks[state.task].primary;
    const rows = data.results.filter(r => r.task === state.task).sort((a, b) => b[state.metric] - a[state.metric]);
    const chartRows = rows.map(r => ({ name: r.model, value: r[state.metric], colour: { Fusion: colours[0], 'MTL-Transformer': colours[1], Transformer: colours[2], LSTM: colours[3] }[r.model] }));
    const best = rows[0];
    return `<div class="study-section-heading"><span>03 / ARCHIVED TEST RESULTS</span><h3>Compare the same task and metric across models</h3><p>Final reported test checkpoints for four sequential model families. Tabular baselines are part of the research route; this comparison uses the four families summarised in the local dashboard.</p></div><div class="study-controls">${select('Prediction task', 'task', Object.entries(tasks).map(([k, t]) => [k, `Task ${k} · ${t.short}`]), state.task)}${select('Comparison metric', 'metric', allowed.map(m => [m, metricNames[m]]), state.metric)}</div><div class="study-result-highlight"><span>${metricNames[state.metric]} · TEST SET</span><strong>${esc(best.model)} <em>${fmt(best[state.metric])}</em></strong><p>Highest recorded ${metricNames[state.metric]} among the four displayed models for ${(state.task === 'C' ? 'ICU length of stay' : tasks[state.task].short.toLowerCase())}.</p></div><div class="study-chart-box"><h4>${tasks[state.task].short} · ${metricNames[state.metric]}</h4>${barChart(chartRows, `${metricNames[state.metric]} by model, test set`)}</div><details class="study-data-table"><summary>View all recorded metrics for this task</summary><div class="study-table-scroll" tabindex="0" aria-label="Test metrics table; scroll horizontally if needed"><table><thead><tr><th scope="col">Model</th>${allowed.map(m => `<th scope="col">${metricNames[m]}</th>`).join('')}<th scope="col">Epoch</th></tr></thead><tbody>${rows.map(r => `<tr><th scope="row">${esc(r.model)}</th>${allowed.map(m => `<td>${fmt(r[m])}</td>`).join('')}<td>${r.best_epoch}</td></tr>`).join('')}</tbody></table></div></details><div class="study-takeaway"><strong>Interpret the comparison by task</strong><p>${state.task === 'C' ? 'LSTM has the highest recorded Macro-F1 (0.4740), while Fusion records 0.4702. The extra model structure does not translate into a consistent gain on length-of-stay classification.' : 'Fusion records the highest AUPRC in this comparison. This is a comparison of archived test summaries, rather than evidence of clinical deployment or superiority on every metric.'}</p></div><p class="study-source-note">Values are read from the archived LSTM, Transformer, MTL and Fusion test-result files, with each model’s recorded checkpoint. Threshold-analysis results are shown separately. Historical summaries are reproduced as reported; the page does not retrain or reevaluate the models.</p>`;
  }
  function diagnostics() {
    const shared = ['MTL-Transformer', 'Fusion'].includes(state.model);
    const rows = data.logs[state.model].filter(r => shared || r.task === state.trainingTask).sort((a, b) => a.epoch - b.epoch);
    const series = (name, key) => ({ name, points: rows.map(r => ({ x: r.epoch, y: r[key] })) });
    const loss = [series('Training loss', shared ? 'train_total_loss' : 'train_loss'), series('Validation loss', shared ? 'val_total_loss' : 'val_loss')];
    const validation = shared ? [series('Task A · AUPRC', 'val_auprc_a'), series('Task B · AUPRC', 'val_auprc_b'), series('Task C · Macro-F1', 'val_macro_f1_c')] : [series(`Validation ${metricNames[tasks[state.trainingTask].primary]}`, 'val_main_metric')];
    const criterion = shared ? 'val_composite_score' : 'val_main_metric';
    const best = [...rows].filter(r => Number.isFinite(r[criterion])).sort((a, b) => b[criterion] - a[criterion])[0];
    const thr = data.thresholds.filter(r => r.task === state.thresholdTask);
    const base = thr.find(r => r.mode === 'default_0.5'), tuned = thr.find(r => r.mode === 'tuned_on_val');
    return `<div class="study-section-heading"><span>04 / TRAINING DIAGNOSTICS</span><h3>Look beyond a final score</h3><p>Training and validation traces show how optimisation progressed. The curves use stored epoch logs, not illustrative or interpolated training data.</p></div><div class="study-controls">${select('Training model', 'model', Object.keys(data.logs).map(m => [m, m]), state.model)}${shared ? '' : select('Training task', 'trainingTask', Object.entries(tasks).map(([k, t]) => [k, `Task ${k} · ${t.short}`]), state.trainingTask)}</div><div class="study-log-summary"><strong>${rows.length} recorded epochs</strong>${best ? `<span>Best logged ${shared ? 'validation composite' : 'validation primary metric'}: ${fmt(best[criterion])} at epoch ${best.epoch}</span>` : ''}</div><div class="study-chart-box"><h4>Training and validation loss</h4>${lineChart(loss, `${state.model}: training and validation loss`, false)}</div><div class="study-chart-box"><h4>Validation metrics</h4>${lineChart(validation, `${state.model}: validation metrics by epoch`, true)}</div><p class="study-source-note">Each plot represents its archived optimisation run. The best logged validation epoch is not necessarily the task-specific checkpoint used in the final result table.</p><div class="study-section-heading threshold-heading"><span>DECISION THRESHOLDS / MTL-TRANSFORMER</span><h3>A higher F1 can come with lower recall</h3><p>Compare the default probability threshold with a threshold selected on the validation set, using the same model’s archived test-set summaries.</p></div><div class="study-controls">${select('Threshold task', 'thresholdTask', [['A', 'Task A · In-hospital mortality'], ['B', 'Task B · 24–48 h mortality']], state.thresholdTask)}</div><div class="study-threshold-cards">${[base, tuned].map((r, i) => `<article><span>${i ? 'VALIDATION-SELECTED' : 'DEFAULT'}</span><strong>${r.threshold.toFixed(2)}</strong><dl>${['precision', 'recall', 'f1'].map(m => `<div><dt>${metricNames[m]}</dt><dd>${fmt(r[m])}</dd></div>`).join('')}</dl></article>`).join('')}</div><div class="study-takeaway"><strong>The trade-off</strong><p>F1 changes from ${fmt(base.f1)} to ${fmt(tuned.f1)}, while recall changes from ${fmt(base.recall)} to ${fmt(tuned.recall)}. The threshold improves one operating-point metric while missing a larger share of positive cases.</p><p>AUROC (${fmt(base.auroc)}) and AUPRC (${fmt(base.auprc)}) remain unchanged: these ranking metrics use the probability scores rather than one chosen classification threshold.</p></div><p class="study-source-note">Threshold source: archived MTL default-versus-validation-tuned test results. These are two recorded operating points; the page does not estimate unrecorded thresholds.</p>`;
  }
  const renderers = { overview, cohort, results, diagnostics };
  function renderPanel() {
    if (!data) return;
    workspace.innerHTML = Object.keys(renderers).map(key => `<section id="study-panel-${key}" role="tabpanel" aria-labelledby="study-tab-${key}" tabindex="0"${state.panel === key ? '' : ' hidden'}>${state.panel === key ? renderers[key]() : ''}</section>`).join('');
    workspace.setAttribute('aria-busy', 'false');
  }
  function activate(key, focus) {
    state.panel = key;
    tabs.forEach(tab => { const selected = tab.dataset.studyTab === key; tab.setAttribute('aria-selected', String(selected)); tab.tabIndex = selected ? 0 : -1; if (selected && focus) tab.focus(); });
    renderPanel();
  }
  function onClick(event) { const tab = event.target.closest('[data-study-tab]'); if (tab) activate(tab.dataset.studyTab); }
  function onChange(event) {
    const control = event.target.closest('[data-study-control]');
    if (!control) return;
    const key = control.dataset.studyControl;
    state[key] = control.value;
    if (key === 'task') state.metric = tasks[state.task].primary;
    renderPanel();
    root.querySelector(`[data-study-control="${key}"]`)?.focus({ preventScroll: true });
  }
  function onKey(event) {
    const tab = event.target.closest('[data-study-tab]');
    if (!tab) return;
    let index = tabs.indexOf(tab);
    if (event.key === 'ArrowRight') index = (index + 1) % tabs.length;
    else if (event.key === 'ArrowLeft') index = (index + tabs.length - 1) % tabs.length;
    else if (event.key === 'Home') index = 0;
    else if (event.key === 'End') index = tabs.length - 1;
    else return;
    event.preventDefault(); activate(tabs[index].dataset.studyTab, true);
  }
  root.addEventListener('click', onClick);
  root.addEventListener('change', onChange);
  root.addEventListener('keydown', onKey);
  fetch('assets/clinical-study.json', { signal: abort.signal }).then(response => { if (!response.ok) throw new Error('Snapshot unavailable'); return response.json(); }).then(snapshot => { if (!abort.signal.aborted) { data = snapshot; renderPanel(); } }).catch(error => { if (error.name !== 'AbortError') { workspace.innerHTML = '<p>The experiment snapshot could not be loaded. Please reopen the project or use the research archive link below.</p>'; workspace.setAttribute('aria-busy', 'false'); } });
  return () => { abort.abort(); window.removeEventListener('resize', sizeToolbar); root.removeEventListener('click', onClick); root.removeEventListener('change', onChange); root.removeEventListener('keydown', onKey); };
}
