import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { formatLocalTime, MONTREAL_TIME_ZONE } from '../../assets/js/lib/time.js';

const at = (iso) => new Date(iso);

describe('formatLocalTime', () => {
  it('utilise le fuseau de Montréal par défaut', () => {
    assert.equal(MONTREAL_TIME_ZONE, 'America/Toronto');
  });

  it('écrit l’heure sur 24 h en français et sur 12 h en anglais (heure normale, UTC-5)', () => {
    const date = at('2026-01-15T19:05:00Z');
    assert.equal(formatLocalTime(date, 'fr'), '14:05 UTC-5');
    assert.equal(formatLocalTime(date, 'en'), '02:05 PM UTC-5');
  });

  it('passe à UTC-4 à l’heure avancée', () => {
    const date = at('2026-07-01T16:30:00Z');
    assert.equal(formatLocalTime(date, 'fr'), '12:30 UTC-4');
    assert.equal(formatLocalTime(date, 'en'), '12:30 PM UTC-4');
  });

  it('écrit minuit « 00:00 » et jamais « 24:00 »', () => {
    const date = at('2026-01-16T05:00:00Z');
    assert.equal(formatLocalTime(date, 'fr'), '00:00 UTC-5');
    assert.equal(formatLocalTime(date, 'en'), '12:00 AM UTC-5');
  });

  it('suit le changement d’heure du 8 mars 2026', () => {
    assert.equal(formatLocalTime(at('2026-03-08T06:30:00Z'), 'fr'), '01:30 UTC-5');
    assert.equal(formatLocalTime(at('2026-03-08T07:30:00Z'), 'fr'), '03:30 UTC-4');
  });

  it('accepte un autre fuseau, y compris un décalage en demi-heure', () => {
    assert.equal(formatLocalTime(at('2026-01-15T19:05:00Z'), 'fr', 'Asia/Kolkata'), '00:35 UTC+5:30');
  });

  it('considère toute langue autre que le français comme de l’anglais', () => {
    assert.equal(formatLocalTime(at('2026-01-15T19:05:00Z'), 'es'), '02:05 PM UTC-5');
  });

  it('affiche l’heure seule si le navigateur ne connaît pas le décalage « shortOffset »', (t) => {
    // Doublure : Intl.DateTimeFormat d'un navigateur ancien, qui refuse l'option timeZoneName.
    const RealDateTimeFormat = Intl.DateTimeFormat;
    t.mock.method(Intl, 'DateTimeFormat', function (locale, options) {
      if (options?.timeZoneName) throw new RangeError('timeZoneName non pris en charge');
      return new RealDateTimeFormat(locale, options);
    });

    assert.equal(formatLocalTime(at('2026-01-15T19:05:00Z'), 'fr'), '14:05');
  });
});
