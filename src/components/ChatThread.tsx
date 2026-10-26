import { useEffect, useRef, useState, type ChangeEvent, type KeyboardEvent, type ReactNode } from 'react';
import { Bot, CheckCheck, ImagePlus, ReceiptText, SendHorizonal, X } from 'lucide-react';
import type { Message, Order } from '../types';
import { formatDayLabel, formatTime, formatZAR } from '../utils/format';
import { calculateTotals } from '../utils/orderWorkflow';
import { StatusPill } from './ui';

export interface OutgoingMessage {
  text: string;
  imageUrl?: string;
  imageName?: string;
}

/** Downscale a locally selected photo so demo state stays light. Frontend-only handling. */
async function fileToDemoDataUrl(file: File): Promise<string> {
  try {
    const bitmap = await createImageBitmap(file);
    const maxDim = 1024;
    const scale = Math.min(1, maxDim / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('no canvas');
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg', 0.82);
  } catch {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(new Error('Could not read that image.'));
      reader.readAsDataURL(file);
    });
  }
}

function OrderCardMessage({
  order,
  perspective,
  onOpenOrder,
}: {
  order: Order;
  perspective: 'customer' | 'shop';
  onOpenOrder: (orderId: string) => void;
}) {
  const totals = calculateTotals(order.items, order.fulfilment, order.deliveryFee);
  const cta =
    perspective === 'customer' && order.status === 'awaiting-customer'
      ? 'Review basket & confirm'
      : perspective === 'customer'
        ? 'View order'
        : 'Open in order panel';
  return (
    <div className="order-card-msg">
      <div className="order-card-msg__head">
        <span>
          <ReceiptText size={16} aria-hidden /> Order {order.ref}
        </span>
        <StatusPill status={order.status} />
      </div>
      <ul className="order-card-msg__items">
        {order.items.slice(0, 4).map((item) => (
          <li key={item.id}>
            <span>
              {item.quantity} × {item.description}
            </span>
            <span>{formatZAR(item.quantity * item.unitPrice)}</span>
          </li>
        ))}
        {order.items.length > 4 && <li className="order-card-msg__more">+ {order.items.length - 4} more item(s)</li>}
      </ul>
      <div className="order-card-msg__total">
        <span>{order.fulfilment === 'delivery' ? 'Total incl. demo delivery' : 'Total (collection)'}</span>
        <strong>{formatZAR(totals.total)}</strong>
      </div>
      <p className="order-card-msg__note">Structured order linked to this conversation · demo prices.</p>
      <button type="button" className="btn btn--primary btn--sm btn--block" onClick={() => onOpenOrder(order.id)}>
        {cta}
      </button>
    </div>
  );
}

export function ChatThread({
  perspective,
  messages,
  getOrder,
  onSend,
  onOpenOrder,
  composerPlaceholder,
  basketBar,
  quickReplies,
  emptyState,
}: {
  perspective: 'customer' | 'shop';
  messages: Message[];
  getOrder: (orderId: string) => Order | undefined;
  onSend: (message: OutgoingMessage) => void;
  onOpenOrder: (orderId: string) => void;
  composerPlaceholder: string;
  basketBar?: ReactNode;
  quickReplies?: string[];
  emptyState?: ReactNode;
}) {
  const [draft, setDraft] = useState('');
  const [pendingImage, setPendingImage] = useState<{ url: string; name: string } | null>(null);
  const [imageError, setImageError] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const node = scrollRef.current;
    if (!node) return;
    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
    node.scrollTo?.({ top: node.scrollHeight, behavior: reduceMotion ? 'auto' : 'smooth' });
  }, [messages.length]);

  const canSend = draft.trim().length > 0 || pendingImage !== null;

  const send = () => {
    if (!canSend) return;
    onSend({
      text: draft.trim(),
      imageUrl: pendingImage?.url,
      imageName: pendingImage?.name,
    });
    setDraft('');
    setPendingImage(null);
    setImageError('');
    textareaRef.current?.focus();
  };

  const onComposerKey = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      send();
    }
  };

  const onPickImage = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setImageError('Please choose an image file (photo) to attach.');
      return;
    }
    try {
      const url = await fileToDemoDataUrl(file);
      setPendingImage({ url, name: file.name });
      setImageError('');
    } catch {
      setImageError('That image could not be read in this browser. Try another photo.');
    }
  };

  let lastDay = '';

  return (
    <div className="chat-thread">
      <div className="chat-scroll" ref={scrollRef} role="log" aria-label="Conversation messages" aria-live="polite">
        {messages.length === 0 && emptyState}
        {messages.map((message) => {
          const day = formatDayLabel(message.createdAt);
          const showDay = day !== lastDay;
          lastDay = day;

          if (message.kind === 'system') {
            return (
              <div key={message.id}>
                {showDay && <div className="chat-day">{day}</div>}
                <div className="chat-system">
                  <span>{message.text}</span>
                </div>
              </div>
            );
          }

          const mine = message.sender === perspective;
          const order = message.orderId ? getOrder(message.orderId) : undefined;

          return (
            <div key={message.id}>
              {showDay && <div className="chat-day">{day}</div>}
              <div className={`chat-row ${mine ? 'chat-row--mine' : 'chat-row--theirs'}`}>
                <div className={`chat-bubble ${mine ? 'chat-bubble--mine' : 'chat-bubble--theirs'}`}>
                  {message.kind === 'order-card' && order ? (
                    <>
                      {message.text && <p className="chat-bubble__text">{message.text}</p>}
                      <OrderCardMessage order={order} perspective={perspective} onOpenOrder={onOpenOrder} />
                    </>
                  ) : (
                    <>
                      {message.attachment && (
                        <figure className="chat-bubble__figure">
                          <img
                            src={message.attachment.url}
                            alt={message.attachment.name}
                            onError={(e) => ((e.target as HTMLImageElement).style.display = 'none')}
                          />
                          <figcaption>Demo image · stored on this device only</figcaption>
                        </figure>
                      )}
                      {message.text && <p className="chat-bubble__text">{message.text}</p>}
                    </>
                  )}
                  <span className="chat-bubble__meta">
                    {formatTime(message.createdAt)}
                    {mine && <CheckCheck size={14} aria-label="Sent (demo)" />}
                  </span>
                  {message.simulated && (
                    <span className="chat-bubble__simulated">
                      <Bot size={13} aria-hidden /> Simulated reply (demo) — no staff member has responded.
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {basketBar}

      {quickReplies && quickReplies.length > 0 && (
        <div className="quick-replies" aria-label="Quick replies">
          {quickReplies.map((reply) => (
            <button
              key={reply}
              type="button"
              className="chip chip--button"
              onClick={() => {
                setDraft(reply);
                textareaRef.current?.focus();
              }}
            >
              {reply}
            </button>
          ))}
        </div>
      )}

      <div className="composer">
        {pendingImage && (
          <div className="composer__preview">
            <img src={pendingImage.url} alt="" />
            <div>
              <strong>{pendingImage.name}</strong>
              <small>Ready to send · demo only, kept on this device</small>
            </div>
            <button
              type="button"
              className="icon-btn"
              onClick={() => setPendingImage(null)}
              aria-label="Remove attached image"
            >
              <X size={18} aria-hidden />
            </button>
          </div>
        )}
        {imageError && (
          <p className="composer__error" role="alert">
            {imageError}
          </p>
        )}
        <div className="composer__row">
          <button
            type="button"
            className="icon-btn composer__attach"
            onClick={() => fileRef.current?.click()}
            aria-label="Attach a photo (demo — stays on this device)"
          >
            <ImagePlus size={22} aria-hidden />
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="visually-hidden" onChange={onPickImage} />
          <label className="visually-hidden" htmlFor="chat-composer-input">
            Type a message
          </label>
          <textarea
            id="chat-composer-input"
            ref={textareaRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={onComposerKey}
            placeholder={composerPlaceholder}
            rows={1}
            maxLength={1000}
          />
          <button
            type="button"
            className="composer__send"
            onClick={send}
            disabled={!canSend}
            aria-label="Send message"
          >
            <SendHorizonal size={20} aria-hidden />
          </button>
        </div>
        <p className="composer__hint">Enter to send · Shift + Enter for a new line · Demo chat — messages are stored on this device only.</p>
      </div>
    </div>
  );
}
