export default function Privacy() {
  return (
    <main className="page narrow">
      <h1>Privacy</h1>
      <ul className="plain-list">
        <li>This site stores no gameplay data.</li>
        <li>No login is used.</li>
        <li>No analytics are used.</li>
        <li>No cookies are used.</li>
        <li>No localStorage is used.</li>
        <li>All scoring happens locally in the browser.</li>
        <li>Refreshing the page clears the current run.</li>
        <li>
          GitHub Pages may process technical access logs as part of hosting, but the app
          itself does not collect or store user data.
        </li>
      </ul>
    </main>
  );
}
