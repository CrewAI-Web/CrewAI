import "../styles/tokens.css";

export const metadata = {
  title: "crewai_claude_v1 · Control Center",
  description: "Orchestrate your full-stack AI crew",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
