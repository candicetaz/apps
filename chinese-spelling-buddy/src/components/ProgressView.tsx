import { useMemo } from 'react';
import { AlertTriangle, Sparkles, Trophy } from 'lucide-react';
import { getCharacterStats, getRecallAttempts, getTestAttempts } from '../lib/storage';

export function ProgressView() {
  const testAttempts = useMemo(() => getTestAttempts(), []);
  const recallAttempts = useMemo(() => getRecallAttempts(), []);
  const charStats = useMemo(() => getCharacterStats(), []);

  const perfectCount = testAttempts.filter((a) => a.correct).length;
  const recallKnowCount = recallAttempts.filter((a) => a.know).length;
  const trickiest = charStats.filter((s) => s.attempts >= 2).slice(0, 10);

  const hasAnyData = testAttempts.length > 0 || recallAttempts.length > 0;

  if (!hasAnyData) {
    return (
      <p className="empty-state">
        No practice history yet. Try a round in <strong>Practise</strong> or <strong>Test</strong> and come back here.
      </p>
    );
  }

  return (
    <div className="progress-view">
      <div className="progress-stat-grid">
        <div className="progress-stat">
          <Trophy size={24} aria-hidden="true" />
          <span className="progress-stat-value">
            {testAttempts.length ? `${perfectCount}/${testAttempts.length}` : '—'}
          </span>
          <span className="progress-stat-label">Characters written perfectly</span>
        </div>
        <div className="progress-stat">
          <Sparkles size={24} aria-hidden="true" />
          <span className="progress-stat-value">
            {recallAttempts.length ? `${recallKnowCount}/${recallAttempts.length}` : '—'}
          </span>
          <span className="progress-stat-label">Test cards marked "I know it"</span>
        </div>
      </div>

      {trickiest.length > 0 && (
        <div className="progress-tricky">
          <h3 className="icon-inline">
            <AlertTriangle size={18} aria-hidden="true" /> Characters to review
          </h3>
          <ul className="progress-tricky-list">
            {trickiest.map((s) => (
              <li key={s.char}>
                <span className="summary-char">{s.char}</span>
                <span className="progress-tricky-ratio">
                  {s.correct}/{s.attempts} perfect
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
