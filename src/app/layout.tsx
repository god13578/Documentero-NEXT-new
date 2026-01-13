import type { ReactNode } from "react";

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="th">
      <head>
        <title>Documentero</title>
      </head>
      <body style={{ margin: 0, fontFamily: "sans-serif" }}>
        {children}
      </body>
    </html>
  );
}
