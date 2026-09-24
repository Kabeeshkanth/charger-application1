import { Button } from './Button';

export function Header({ title, username, onLogout }: { title: string; username?: string; onLogout?: () => void }) {
  return <header className="app-header"><div><h1>{title}</h1>{username && <p>Welcome, {username}</p>}</div>{onLogout && <Button variant="secondary" onClick={onLogout}>Log out</Button>}</header>;
}
