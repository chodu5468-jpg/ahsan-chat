import Logo from './Logo';
import ThemeSwitcher from './ThemeSwitcher';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';

function initials(username) {
  return username.slice(0, 2).toUpperCase();
}

export default function Sidebar({
  users,
  loading,
  search,
  onSearchChange,
  activeUserId,
  onSelect,
  className = ''
}) {
  const { user, logout } = useAuth();
  const { onlineUserIds } = useSocket();

  return (
    <aside className={`sidebar ${className}`}>
      <div className="sidebar__header">
        <Logo size="sm" />
        <ThemeSwitcher align="right" />
      </div>

      <div className="sidebar__search">
        <input
          type="search"
          placeholder="Find a friend"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          aria-label="Search contacts"
        />
      </div>

      <div className="sidebar__list">
        {loading && <p className="sidebar__empty">Loading contacts&hellip;</p>}

        {!loading && users.length === 0 && (
          <p className="sidebar__empty">
            {search ? 'No one matches that search.' : 'No other friends have joined yet — invite one.'}
          </p>
        )}

        {!loading &&
          users.map((contact) => {
            const isOnline = onlineUserIds.has(contact.id);
            const isActive = contact.id === activeUserId;
            return (
              <button
                key={contact.id}
                type="button"
                className={`contact ${isActive ? 'contact--active' : ''}`}
                onClick={() => onSelect(contact.id)}
              >
                <span className="contact__avatar" style={{ background: contact.avatarColor }}>
                  {initials(contact.username)}
                  {isOnline && <span className="contact__online-dot" aria-hidden="true" />}
                </span>
                <span className="contact__meta">
                  <span className="contact__name">{contact.username}</span>
                  <span className="contact__status">{isOnline ? 'Online' : 'Offline'}</span>
                </span>
                {contact.unreadCount > 0 && (
                  <span className="contact__badge">{contact.unreadCount}</span>
                )}
              </button>
            );
          })}
      </div>

      <div className="sidebar__footer">
        <span className="contact__avatar contact__avatar--self" style={{ background: user.avatarColor }}>
          {initials(user.username)}
        </span>
        <span className="sidebar__username">{user.username}</span>
        <button type="button" className="sidebar__logout" onClick={logout}>
          Log out
        </button>
      </div>
    </aside>
  );
}
