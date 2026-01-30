import '../admin/admin-styles.css';

export default function InviteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="admin-dark">{children}</div>;
}
