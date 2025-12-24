import Link from "next/link";

export default function Home() {
  return (
    <div style={{ padding: 30 }}>
      <h1>Documentero Dashboard</h1>
      <ul>
        <li><Link href="/builder">Builder</Link></li>
        <li><Link href="/preview">Preview PDF</Link></li>
      </ul>
    </div>
  );
}
