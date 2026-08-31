import Avatar from "./Avatar.jsx";

export default function UserListItem({ user, active, online, onClick }) {
  return (
    <button
      className={`user-list-item${active ? " active" : ""}`}
      onClick={onClick}
      type="button"
    >
      <div className="user-list-avatar">
        <Avatar username={user.username} color={user.avatarColor} size={42} />
        {online && <span className="online-dot" aria-label="Online" />}
      </div>
      <div className="user-list-meta">
        <span className="user-list-name">{user.username}</span>
        <span className="user-list-status">{online ? "Online" : "Offline"}</span>
      </div>
    </button>
  );
}
