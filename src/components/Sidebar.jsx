import { useState, useMemo } from "react";
import Logo from "./Logo.jsx";
import UserListItem from "./UserListItem.jsx";
import { SearchIcon, LogoutIcon } from "./Icons.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import Avatar from "./Avatar.jsx";

export default function Sidebar({ users, activeUserId, onSelectUser, onlineIds, mobileOpen }) {
  const [query, setQuery] = useState("");
  const { user, logout } = useAuth();

  const filtered = useMemo(() => {
    if (!query.trim()) return users;
    return users.filter((u) => u.username.toLowerCase().includes(query.trim().toLowerCase()));
  }, [users, query]);

  return (
    <aside className={`sidebar${mobileOpen ? " mobile-open" : ""}`}>
      <div className="sidebar-header">
        <Logo size="sm" />
      </div>

      <div className="sidebar-search">
        <SearchIcon />
        <input
          type="text"
          placeholder="Find a friend"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <div className="sidebar-list">
        {filtered.length === 0 && (
          <p className="sidebar-empty">
            {users.length === 0
              ? "No one else has joined yet — invite a friend."
              : "No matches for that search."}
          </p>
        )}
        {filtered.map((u) => (
          <UserListItem
            key={u.id}
            user={u}
            active={u.id === activeUserId}
            online={onlineIds.has(u.id)}
            onClick={() => onSelectUser(u)}
          />
        ))}
      </div>

      <div className="sidebar-footer">
        <div className="sidebar-me">
          <Avatar username={user?.username} color={user?.avatarColor} size={34} />
          <span>{user?.username}</span>
        </div>
        <button className="icon-btn" onClick={logout} title="Log out" type="button">
          <LogoutIcon />
        </button>
      </div>
    </aside>
  );
}
