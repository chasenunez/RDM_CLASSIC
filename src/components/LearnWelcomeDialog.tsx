import { useEffect, useRef, useState } from 'react';
import { useGame } from '../GameContext';
import { ASSETS, CHAT_CONTACTS } from '../theme';

/**
 * The learn-mode opening, in the same instant-messenger window as the test-mode
 * one so the two feel like the same app.
 *
 * The premise is unchanged (a colleague wants the old side project) but the
 * framing is not. Test mode says "find every problem, wrong guesses count
 * against you". This says "we can get this ready together, and it is less work
 * than it looks". The difference is deliberate: someone who has never heard of
 * research data management should not open this and feel examined.
 */

const SCREEN_NAME = 'Lib4RI';
const PLAYER_NAME = 'you_1997';

const CHAT_LINES: React.ReactNode[] = [
  <>Remember that side project that went nowhere? A new colleague wants to pick it
    up, which is lovely news, except the files are in a bit of a state.</>,
  <>Good news: nothing here is broken, and none of it is hard. It is about ten
    small changes, and most of them are renaming things.</>,
  <>We will go through them together, roughly easiest first. I will tell you what
    to open, explain what is wrong with it and why it matters, and then we fix it.</>,
  <>Nothing is scored and there is nothing to guess. If you have never done any of
    this before, that is exactly who this is for.</>,
  <>By the end you will have a project you could hand to anyone, and you will know
    why each piece of it matters.</>,
  <>Ready when you are (^‿^)</>,
];

/** One buddy-list group: a header, then the names under it. */
function ContactGroup({ title, names, online }: { title: string; names: readonly string[]; online: boolean }) {
  return (
    <>
      <div className="aim-list__group">{title}</div>
      {names.map(name => (
        <div className={`aim-list__contact${online ? '' : ' aim-list__contact--offline'}`} key={name}>
          <span className="aim-list__bullet" aria-hidden="true" />
          <span className="aim-list__name">{name}</span>
        </div>
      ))}
    </>
  );
}

export function LearnWelcomeDialog() {
  const { dispatch } = useGame();
  const goRef = useRef<HTMLButtonElement>(null);
  const logRef = useRef<HTMLDivElement>(null);
  const [shownCount, setShownCount] = useState(1);
  const allShown = shownCount >= CHAT_LINES.length;

  useEffect(() => { goRef.current?.focus(); }, []);

  // Only scrolls on a viewport too short for the whole conversation.
  useEffect(() => {
    const log = logRef.current;
    if (!log || log.scrollHeight <= log.clientHeight) return;
    const newest = log.children[shownCount - 1] as HTMLElement | undefined;
    newest?.scrollIntoView({ block: 'nearest' });
  }, [shownCount]);

  const advance = () => {
    if (allShown) dispatch({ type: 'DISMISS_WELCOME' });
    else setShownCount(n => n + 1);
  };

  return (
    <div className="dialog-overlay" role="dialog" aria-modal="true" aria-labelledby="learn-welcome-title">
      <div className="dialog aim-window" style={{ padding: 0, overflow: 'hidden' }}>

        <div className="dialog__chrome-bar">
          <button className="window__close" aria-hidden="true" tabIndex={-1}>×</button>
          <span className="window__title" id="learn-welcome-title">
            Instant Message from {SCREEN_NAME}
          </span>
        </div>

        <div className="aim-body">
          <div className="aim-list" aria-hidden="true">
            <ContactGroup title="Online" names={CHAT_CONTACTS.online} online />
            <ContactGroup title="Offline" names={CHAT_CONTACTS.offline} online={false} />
            <div className="aim-list__status">
              <span className="aim-list__bullet" />
              <span className="aim-list__name">{PLAYER_NAME} (Online)</span>
            </div>
          </div>

          <div className="aim-conversation">
            <div className="aim-chat__log" ref={logRef} aria-live="polite">
              {/* Every line is laid out from the start, with the unsaid ones
                  merely invisible, so the window opens at full height and never
                  jumps as the conversation fills in. */}
              {CHAT_LINES.map((line, i) => (
                <p
                  className={`aim-chat__line${i < shownCount ? '' : ' aim-chat__line--pending'}`}
                  key={i}
                  aria-hidden={i < shownCount ? undefined : true}
                >
                  <span className="aim-chat__screenname">{SCREEN_NAME}: </span>
                  {line}
                </p>
              ))}
            </div>

            <div className="aim-chat__compose">
              <div className="aim-chat__input" aria-hidden="true" />
              <button
                ref={goRef}
                className={`mac-button mac-button--default${allShown ? '' : ' mac-button--pulse'}`}
                onClick={advance}
              >
                {allShown ? <>Let&apos;s start</> : <>Next</>}
              </button>
            </div>
          </div>

          <div className="aim-portraits" aria-hidden="true">
            <figure className="aim-portrait">
              <img src={ASSETS.chatAvatarSender} alt="" />
              <figcaption>{SCREEN_NAME}</figcaption>
            </figure>
            <figure className="aim-portrait">
              <img src={ASSETS.chatAvatarPlayer} alt="" />
              <figcaption>{PLAYER_NAME}</figcaption>
            </figure>
          </div>
        </div>
      </div>
    </div>
  );
}
