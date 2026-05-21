import { CodeBlock } from './code-block'
import { Callout } from './callout'

function Step({ num, title, children }: { num: number; title: string; children: React.ReactNode }) {
  return (
    <div className="mb-5 flex max-w-[640px] gap-3.5">
      <span className="grid h-7 w-7 flex-shrink-0 place-items-center rounded-full border border-[var(--border)] bg-[var(--surface)] font-mono text-[12px] font-medium text-[var(--muted)]">
        {num}
      </span>
      <div>
        <h3 className="mb-1 text-[14px] font-semibold text-[var(--foreground)]">{title}</h3>
        <div className="text-[13px] leading-[1.5] text-[var(--muted)]">{children}</div>
      </div>
    </div>
  )
}

function InlineC({ children }: { children: React.ReactNode }) {
  return (
    <code className="whitespace-nowrap rounded-md border border-[var(--border)] bg-[var(--surface)] px-1.5 py-px font-mono text-[13px] text-[var(--foreground)]">
      {children}
    </code>
  )
}

export function DocsContent() {
  return (
    <>
      {/* Introduction */}
      <section className="section mb-12 scroll-mt-12" id="introduction">
        <h1 className="mb-1 font-[var(--font-display)] text-[28px] font-semibold leading-tight tracking-[-0.02em] text-[var(--foreground)]">
          Documentation
        </h1>
        <p className="mb-10 text-[14px] text-[var(--muted)]">
          Everything you need to build forms online and collect data offline — even without internet.
        </p>

        <p className="mb-4 max-w-[640px] text-[14px] leading-[1.55] text-[var(--foreground)]">
          FieldKit is a form builder designed for NGOs and field teams collecting data in areas with
          unreliable internet. You create forms on the web platform, share them with your team, and
          collect responses through three channels:
        </p>

        <ul className="mb-4 max-w-[640px] list-disc pl-5 text-[14px] leading-[1.55] text-[var(--foreground)] [&_li]:mb-2">
          <li><strong>Online</strong> — respondents fill forms through a shareable link</li>
          <li><strong>Local server</strong> — run forms on a local Wi-Fi network, no internet required</li>
          <li><strong>Mobile app</strong> — download forms to a phone, collect responses offline, sync when back online</li>
        </ul>

        <p className="mb-4 max-w-[640px] text-[14px] leading-[1.55] text-[var(--foreground)]">
          Form definitions always live on the web platform. The local server and mobile app import
          configs and send responses back — they never edit the form itself. This keeps a single source
          of truth and prevents conflicts.
        </p>
      </section>

      {/* Serverside platform */}
      <section className="section mb-12 scroll-mt-12" id="serverside">
        <h2 className="mb-3 font-[var(--font-display)] text-[22px] font-semibold text-[var(--foreground)]">
          Serverside platform
        </h2>
        <p className="mb-4 max-w-[640px] text-[14px] leading-[1.55] text-[var(--foreground)]">
          The web platform is where everything starts. Sign in with your Google account to access the
          dashboard, where you can see all your forms, create new ones, and manage responses.
        </p>

        <h3 className="mb-2 mt-5 text-[14px] font-semibold text-[var(--foreground)]">Authentication</h3>
        <p className="mb-4 max-w-[640px] text-[14px] leading-[1.55] text-[var(--foreground)]">
          Login uses Google OAuth — no separate email and password to manage. Anyone with
          a Google account can sign in and start building forms immediately.
        </p>

        <h3 className="mb-2 mt-5 text-[14px] font-semibold text-[var(--foreground)]">Dashboard</h3>
        <p className="mb-4 max-w-[640px] text-[14px] leading-[1.55] text-[var(--foreground)]">
          The dashboard lists all your forms with live stats — response counts, submission sources,
          and status indicators. You can search across forms, create new ones with one click, and
          access the builder, responses, and sharing options per form.
        </p>

        <h3 className="mb-2 mt-5 text-[14px] font-semibold text-[var(--foreground)]">Form lifecycle</h3>
        <p className="mb-4 max-w-[640px] text-[14px] leading-[1.55] text-[var(--foreground)]">
          A form can be in three states: draft (only you can see it), published (respondents can
          submit), and closed (no new submissions accepted). Toggle between them from the form's
          share modal. Closing a form preserves all existing responses.
        </p>
      </section>

      {/* Creating a form */}
      <section className="section mb-12 scroll-mt-12" id="serverside-create">
        <h2 className="mb-3 font-[var(--font-display)] text-[22px] font-semibold text-[var(--foreground)]">
          Creating a form
        </h2>
        <p className="mb-4 max-w-[640px] text-[14px] leading-[1.55] text-[var(--foreground)]">
          Click "New form" on the dashboard to open the builder. Every form starts with a title and an
          empty field list — you build it up from scratch.
        </p>

        <h3 className="mb-2 mt-5 text-[14px] font-semibold text-[var(--foreground)]">Adding fields</h3>
        <p className="mb-4 max-w-[640px] text-[14px] leading-[1.55] text-[var(--foreground)]">
          Click the <strong>+ Add field</strong> button and pick a field type. FieldKit supports
          ten field types:
        </p>
        <ul className="mb-4 max-w-[640px] list-disc pl-5 text-[14px] leading-[1.55] text-[var(--foreground)] [&_li]:mb-1">
          <li><strong>Text</strong> — single-line input with min/max length and regex pattern validation</li>
          <li><strong>Email</strong> — email input with automatic format validation</li>
          <li><strong>Number</strong> — numeric input with min/max value constraints</li>
          <li><strong>Long text</strong> — multi-line textarea with character limits</li>
          <li><strong>Dropdown</strong> — single-select from a list of options</li>
          <li><strong>Single choice</strong> — radio buttons, one selection allowed</li>
          <li><strong>Multiple choice</strong> — checkboxes with an optional max selections limit</li>
          <li><strong>Date</strong> — date picker with min/max date bounds</li>
          <li><strong>File upload</strong> — file input with accepted type and size restrictions</li>
          <li><strong>Rating</strong> — star rating with configurable max stars</li>
        </ul>
        <p className="mb-4 max-w-[640px] text-[14px] leading-[1.55] text-[var(--foreground)]">
          Each field also supports a <strong>label</strong>, <strong>placeholder</strong>,{' '}
          <strong>help text</strong>, and a <strong>required</strong> toggle. Required fields
          block submission until filled.
        </p>

        <h3 className="mb-2 mt-5 text-[14px] font-semibold text-[var(--foreground)]">Reordering fields</h3>
        <p className="mb-4 max-w-[640px] text-[14px] leading-[1.55] text-[var(--foreground)]">
          Drag any field by its handle to reorder. The order you set in the builder is the order
          respondents see — on web, local server, and mobile. Field order is preserved in the exported
          config JSON.
        </p>

        <h3 className="mb-2 mt-5 text-[14px] font-semibold text-[var(--foreground)]">Field settings</h3>
        <p className="mb-4 max-w-[640px] text-[14px] leading-[1.55] text-[var(--foreground)]">
          Click any field in the builder to open its settings panel on the right. The panel shows
          type-specific options: text fields get length and pattern validators, choice fields get
          option lists, file fields get type and size limits. Changes save automatically.
        </p>

        <h3 className="mb-2 mt-5 text-[14px] font-semibold text-[var(--foreground)]">Form settings</h3>
        <p className="mb-4 max-w-[640px] text-[14px] leading-[1.55] text-[var(--foreground)]">
          Beyond individual fields, you can set a <strong>submit button label</strong>, a{' '}
          <strong>confirmation message</strong> shown after successful submission, and whether to{' '}
          <strong>allow multiple submissions</strong> from the same respondent. The title and
          description are editable inline at the top of the builder canvas.
        </p>

        <h3 className="mb-2 mt-5 text-[14px] font-semibold text-[var(--foreground)]">Preview</h3>
        <p className="mb-4 max-w-[640px] text-[14px] leading-[1.55] text-[var(--foreground)]">
          Click <strong>Preview</strong> in the builder toolbar to see the form exactly as respondents
          will see it. The preview is interactive — you can fill fields and submit to verify
          validation rules and the confirmation message.
        </p>
      </section>

      {/* Sharing & publishing */}
      <section className="section mb-12 scroll-mt-12" id="serverside-share">
        <h2 className="mb-3 font-[var(--font-display)] text-[22px] font-semibold text-[var(--foreground)]">
          Sharing &amp; publishing
        </h2>
        <p className="mb-4 max-w-[640px] text-[14px] leading-[1.55] text-[var(--foreground)]">
          Open a form and click <strong>Share</strong> in the toolbar to open the share modal. From
          here you can distribute the form, control its visibility, and export its config.
        </p>

        <Step num={1} title="Copy the public link">
          Each form gets a short public URL (<InlineC>/f/form-id</InlineC>). Copy it and send
          to respondents — they don't need accounts to fill it out.
        </Step>

        <Step num={2} title="Show QR code">
          Display a QR code that links to the form. Respondents scan it with their phone to open
          the form. The mobile app also scans this QR to import the form config.
        </Step>

        <Step num={3} title="Embed snippet">
          Copy an HTML snippet to embed the form into an existing website. The embed is an iframe
          pointing at the form's public URL.
        </Step>

        <Step num={4} title="Publish or close">
          Use the publish toggle to make the form visible to respondents. When a form is
          unpublished, only you can see it. Close it to stop accepting new submissions
          while keeping existing responses accessible.
        </Step>

        <Step num={5} title="Download config">
          Export the form as a JSON file. This config contains everything — field definitions,
          validation rules, settings, and a secret key for mobile sync. Use it with the local
          server or mobile app.
        </Step>

        <Callout>
          <strong>Important:</strong> The exported config includes a <strong>mobile secret</strong> —
          a unique key that lets the mobile app and local server authenticate with the web
          platform. Don't share the config file publicly. Only distribute it to devices that
          need to collect responses.
        </Callout>
      </section>

      {/* Realtime responses table */}
      <section className="section mb-12 scroll-mt-12" id="serverside-responses">
        <h2 className="mb-3 font-[var(--font-display)] text-[22px] font-semibold text-[var(--foreground)]">
          Realtime responses table
        </h2>
        <p className="mb-4 max-w-[640px] text-[14px] leading-[1.55] text-[var(--foreground)]">
          Every form has a live responses table. When a respondent submits the form — whether through
          the web link, the local server syncing up, or the mobile app — the new row appears
          automatically. No refresh needed.
        </p>

        <h3 className="mb-2 mt-5 text-[14px] font-semibold text-[var(--foreground)]">How it works</h3>
        <p className="mb-4 max-w-[640px] text-[14px] leading-[1.55] text-[var(--foreground)]">
          FieldKit uses <strong>Server-Sent Events</strong> (SSE) backed by Postgres{' '}
          <InlineC>LISTEN/NOTIFY</InlineC>. When a response is inserted into the database, a trigger
          fires a NOTIFY event. The server pushes this to every connected browser through a streaming
          HTTP response. There's no polling and no WebSocket overhead — the table updates within
          milliseconds of a submission.
        </p>

        <h3 className="mb-2 mt-5 text-[14px] font-semibold text-[var(--foreground)]">Filtering by source</h3>
        <p className="mb-4 max-w-[640px] text-[14px] leading-[1.55] text-[var(--foreground)]">
          Each response carries a <strong>source</strong> label — <strong>online</strong>,{' '}
          <strong>mobile</strong>, or <strong>localserver</strong>. Use the source filter above the
          table to show only responses from a specific channel. This is useful when you want to
          verify data coming in from a particular field team or device.
        </p>

        <h3 className="mb-2 mt-5 text-[14px] font-semibold text-[var(--foreground)]">Importing local data</h3>
        <p className="mb-4 max-w-[640px] text-[14px] leading-[1.55] text-[var(--foreground)]">
          If you collected responses on a local server, export them from there first, then upload the
          file here. FieldKit deduplicates by <InlineC>(formId, submissionId)</InlineC>, so you
          can re-import the same export file safely — already-imported rows will be counted as
          duplicates and skipped.
        </p>

        <h3 className="mb-2 mt-5 text-[14px] font-semibold text-[var(--foreground)]">Exporting response data</h3>
        <p className="mb-4 max-w-[640px] text-[14px] leading-[1.55] text-[var(--foreground)]">
          Download responses as <strong>CSV</strong>, <strong>JSON</strong>, or <strong>XLSX</strong>.
          The export respects the current source filter, so you can export only mobile responses
          or only online submissions.
        </p>

        <Callout>
          <strong>Tip:</strong> Keep the responses table open during active data collection.
          Watching submissions arrive in real time is the fastest way to catch issues — a field
          team sending unexpected values, a validation gap, or a form configuration problem
          shows up immediately.
        </Callout>
      </section>

      {/* Exporting a form config */}
      <section className="section mb-12 scroll-mt-12" id="serverside-export">
        <h2 className="mb-3 font-[var(--font-display)] text-[22px] font-semibold text-[var(--foreground)]">
          Exporting a form config
        </h2>
        <p className="mb-4 max-w-[640px] text-[14px] leading-[1.55] text-[var(--foreground)]">
          The exported JSON file is the bridge between the web platform and offline tools. It
          contains everything needed to reproduce the form on another device.
        </p>

        <h3 className="mb-2 mt-5 text-[14px] font-semibold text-[var(--foreground)]">What's in the config</h3>
        <p className="mb-4 max-w-[640px] text-[14px] leading-[1.55] text-[var(--foreground)]">
          The config is a single <InlineC>.json</InlineC> file with the form's ID, title,
          description, version number, field definitions (type, label, validation rules, options),
          display settings (submit button text, confirmation message, multi-submit policy), and
          a <strong>mobile secret</strong>. The secret is a unique token generated per form that
          authenticates sync requests from the mobile app and local server. The config also
          includes a <InlineC>_serverUrl</InlineC> so offline tools know where to sync back to.
        </p>

        <h3 className="mb-2 mt-5 text-[14px] font-semibold text-[var(--foreground)]">Versioning</h3>
        <p className="mb-4 max-w-[640px] text-[14px] leading-[1.55] text-[var(--foreground)]">
          Each time you save the form in the builder, the version number increments. When you export
          and re-import a config to the mobile app, the app compares versions to detect that you have
          the latest form definition.
        </p>

        <h3 className="mb-2 mt-5 text-[14px] font-semibold text-[var(--foreground)]">Export to local server</h3>
        <p className="mb-4 max-w-[640px] text-[14px] leading-[1.55] text-[var(--foreground)]">
          Download the config JSON, then open the local server web UI in your browser, drag the file
          into the import area, and the form is live on your LAN. See the Localserver section below
          for the full workflow.
        </p>

        <h3 className="mb-2 mt-5 text-[14px] font-semibold text-[var(--foreground)]">Export to mobile app</h3>
        <p className="mb-4 max-w-[640px] text-[14px] leading-[1.55] text-[var(--foreground)]">
          In the mobile app, scan the QR code shown in the share modal, or manually select the
          downloaded config file. The app reads the server URL and secret from the config and
          configures sync automatically.
        </p>
      </section>

      {/* Localserver overview */}
      <section className="section mb-12 scroll-mt-12" id="localserver">
        <h2 className="mb-3 font-[var(--font-display)] text-[22px] font-semibold text-[var(--foreground)]">
          Localserver overview
        </h2>
        <p className="mb-4 max-w-[640px] text-[14px] leading-[1.55] text-[var(--foreground)]">
          FieldKit Localserver is a lightweight Node.js server that runs on a single machine —
          a laptop, a Raspberry Pi, or any device that can run Node.js. It serves your form on a
          local Wi-Fi network so nearby devices can submit responses without any internet access.
        </p>

        <h3 className="mb-2 mt-5 text-[14px] font-semibold text-[var(--foreground)]">When to use it</h3>
        <p className="mb-4 max-w-[640px] text-[14px] leading-[1.55] text-[var(--foreground)]">
          Localserver is the right choice when you're in the field with a group of people who need
          to submit the same form — a community health screening, a workshop registration, a
          field inventory. Everyone connects to the same Wi-Fi network (or hotspot), opens the
          form URL, and submits. Responses are stored in a local SQLite database until you
          export them.
        </p>

        <h3 className="mb-2 mt-5 text-[14px] font-semibold text-[var(--foreground)]">What it doesn't do</h3>
        <p className="mb-4 max-w-[640px] text-[14px] leading-[1.55] text-[var(--foreground)]">
          Localserver does not edit forms. You import a config, serve it, and collect responses.
          Form changes always happen on the web platform. Localserver also doesn't sync
          automatically — you export response data from the web UI and import it into the web
          platform manually.
        </p>

        <Callout>
          <strong>Tip:</strong> Localserver works great with a phone hotspot. Turn on your
          phone's hotspot, connect the localserver machine and respondent devices to it,
          and you have a self-contained data-collection network. No cell signal needed beyond
          the hotspot itself.
        </Callout>
      </section>

      {/* Installation */}
      <section className="section mb-12 scroll-mt-12" id="localserver-install">
        <h2 className="mb-3 font-[var(--font-display)] text-[22px] font-semibold text-[var(--foreground)]">
          Installation
        </h2>
        <p className="mb-4 max-w-[640px] text-[14px] leading-[1.55] text-[var(--foreground)]">
          FieldKit Localserver is distributed as an npm package. Install it once globally:
        </p>
        <CodeBlock lang="bash">npm install -g @malichamdan/fieldkit-local-server</CodeBlock>

        <p className="mb-4 max-w-[640px] text-[14px] leading-[1.55] text-[var(--foreground)]">
          Verify the installation worked:
        </p>
        <CodeBlock lang="bash">fieldkit --version</CodeBlock>

        <h3 className="mb-2 mt-5 text-[14px] font-semibold text-[var(--foreground)]">Requirements</h3>
        <ul className="mb-4 max-w-[640px] list-disc pl-5 text-[14px] leading-[1.55] text-[var(--foreground)] [&_li]:mb-1">
          <li>Node.js 18 or later</li>
          <li>npm 9 or later (comes with Node.js)</li>
          <li>Any OS: macOS, Windows, or Linux</li>
          <li>No database setup needed — SQLite is bundled</li>
        </ul>

        <Callout>
          <strong>One-time setup:</strong> Installation is the only terminal command you need.
          Everything else — importing configs, serving forms, exporting data — is done through
          the web UI at <InlineC>http://localhost:3000</InlineC>.
        </Callout>
      </section>

      {/* Importing & serving */}
      <section className="section mb-12 scroll-mt-12" id="localserver-import">
        <h2 className="mb-3 font-[var(--font-display)] text-[22px] font-semibold text-[var(--foreground)]">
          Importing a config &amp; serving
        </h2>
        <p className="mb-4 max-w-[640px] text-[14px] leading-[1.55] text-[var(--foreground)]">
          Once installed, the entire workflow happens through the browser. No terminal commands
          beyond starting the server.
        </p>

        <Step num={1} title="Start the server">
          Run <InlineC>fieldkit</InlineC> in your terminal. This starts the server and
          prints the local URL (e.g. <InlineC>http://192.168.1.5:3000</InlineC>).
          <CodeBlock lang="bash">fieldkit</CodeBlock>
        </Step>

        <Step num={2} title="Open the admin panel">
          Open the URL shown in your terminal. You'll see the localserver admin page with
          sections for importing configs, viewing responses, and exporting data.
        </Step>

        <Step num={3} title="Import the config">
          Drag your downloaded config JSON file into the import area, or click to browse.
          The server validates the config and loads the form immediately.
        </Step>

        <Step num={4} title="Form is live">
          Once imported, any device on the same Wi-Fi network can open the form at{' '}
          <InlineC>http://your-ip:3000</InlineC>. The localserver admin page shows a
          link you can share.
        </Step>

        <Callout>
          <strong>Multiple forms:</strong> You can import more than one config. Each form
          gets its own route and collects responses independently. Switch between forms
          from the admin panel.
        </Callout>
      </section>

      {/* Exporting data */}
      <section className="section mb-12 scroll-mt-12" id="localserver-data">
        <h2 className="mb-3 font-[var(--font-display)] text-[22px] font-semibold text-[var(--foreground)]">
          Exporting collected data
        </h2>
        <p className="mb-4 max-w-[640px] text-[14px] leading-[1.55] text-[var(--foreground)]">
          Open the localserver web UI and go to the <strong>Responses</strong> section. You'll
          see all submissions collected since the last import, with a live count that updates as
          new responses come in (the admin UI uses SSE to push new rows in real time).
        </p>

        <p className="mb-4 max-w-[640px] text-[14px] leading-[1.55] text-[var(--foreground)]">
          Click <strong>Export</strong> and choose CSV or JSON. The file downloads to your
          device. Then, back on the web platform, open the same form's responses table, click{' '}
          <strong>Import</strong>, and upload the file. Responses are deduplicated by submission
          ID, so re-importing the same data is safe.
        </p>

        <Callout>
          <strong>Tip:</strong> Export regularly if you're collecting for a long session.
          Localserver stores everything in SQLite, which is reliable, but the only copy is
          on that machine until you export. A quick export between sessions protects against
          hardware failure.
        </Callout>
      </section>

      {/* Network setup */}
      <section className="section mb-12 scroll-mt-12" id="localserver-network">
        <h2 className="mb-3 font-[var(--font-display)] text-[22px] font-semibold text-[var(--foreground)]">
          Local network setup
        </h2>
        <p className="mb-4 max-w-[640px] text-[14px] leading-[1.55] text-[var(--foreground)]">
          Localserver binds to <InlineC>0.0.0.0</InlineC>, so it's accessible from any device
          on the same network. Here's what to check if devices can't reach it:
        </p>

        <ul className="mb-4 max-w-[640px] list-disc pl-5 text-[14px] leading-[1.55] text-[var(--foreground)] [&_li]:mb-2">
          <li>
            <strong>Firewall:</strong> Your OS may block incoming connections on port 3000. On macOS,
            allow Node.js when prompted. On Windows, allow Node.js through Windows Defender
            Firewall. On Linux, check <InlineC>ufw</InlineC> or <InlineC>firewalld</InlineC>.
          </li>
          <li>
            <strong>Same network:</strong> All devices must be on the same Wi-Fi network or
            hotspot. Isolated guest networks or VLANs can block device-to-device communication.
          </li>
          <li>
            <strong>Static IP:</strong> If you restart the localserver machine, its IP may change.
            Use a static IP or reserved DHCP lease if you're running localserver repeatedly in
            the same location.
          </li>
          <li>
            <strong>Port already in use:</strong> If port 3000 is taken, set the{' '}
            <InlineC>PORT</InlineC> environment variable: <InlineC>PORT=3001 fieldkit</InlineC>.
          </li>
        </ul>
      </section>

      {/* Mobile client overview */}
      <section className="section mb-12 scroll-mt-12" id="mobile-overview">
        <h2 className="mb-3 font-[var(--font-display)] text-[22px] font-semibold text-[var(--foreground)]">
          Mobile client overview
        </h2>
        <p className="mb-4 max-w-[640px] text-[14px] leading-[1.55] text-[var(--foreground)]">
          The FieldKit mobile app is built with Expo (React Native) and runs on iOS and Android.
          It's designed for offline-first data collection — you download form configs from the web
          platform, fill them anywhere, and sync responses when you're back online.
        </p>

        <h3 className="mb-2 mt-5 text-[14px] font-semibold text-[var(--foreground)]">How it works</h3>
        <p className="mb-4 max-w-[640px] text-[14px] leading-[1.55] text-[var(--foreground)]">
          You import a form config once (via QR scan or file). The form and all its field definitions
          are stored locally on the device. You can open, fill, and submit the form any number of
          times — with or without a connection. Each submission is saved to a local queue and synced
          to the web platform when connectivity returns.
        </p>

        <h3 className="mb-2 mt-5 text-[14px] font-semibold text-[var(--foreground)]">Key capabilities</h3>
        <ul className="mb-4 max-w-[640px] list-disc pl-5 text-[14px] leading-[1.55] text-[var(--foreground)] [&_li]:mb-1">
          <li>Import forms via QR code scan or JSON file</li>
          <li>Offline form filling — all field types supported, including file uploads</li>
          <li>File attachments via camera or gallery (uses <InlineC>expo-image-picker</InlineC>)</li>
          <li>Background sync engine with automatic retry</li>
          <li>Connection-aware: pauses sync when offline, resumes when back online</li>
          <li>Configurable server URL — point at your own FieldKit instance</li>
        </ul>
      </section>

      {/* Importing a form config */}
      <section className="section mb-12 scroll-mt-12" id="mobile-import">
        <h2 className="mb-3 font-[var(--font-display)] text-[22px] font-semibold text-[var(--foreground)]">
          Importing a form config
        </h2>
        <p className="mb-4 max-w-[640px] text-[14px] leading-[1.55] text-[var(--foreground)]">
          There are two ways to get a form onto the mobile app. Both use the same config JSON
          file you export from the web platform.
        </p>

        <Step num={1} title="Scan QR code">
          On the web platform, open the share modal for your form and show the QR code. In the
          mobile app, tap the scan button and point your camera at the QR. The app reads the
          form config and server URL from the QR data and imports everything automatically.
        </Step>

        <Step num={2} title="Manual file import">
          Download the config JSON from the share modal. In the mobile app, tap Import and
          select the file from your device. Use this method when you can't show a QR code
          — for example, when you receive the config file via email or messaging app.
        </Step>

        <h3 className="mb-2 mt-5 text-[14px] font-semibold text-[var(--foreground)]">Server URL configuration</h3>
        <p className="mb-4 max-w-[640px] text-[14px] leading-[1.55] text-[var(--foreground)]">
          The config file includes a <InlineC>_serverUrl</InlineC> field. This tells the app
          where to sync responses. It's set automatically when you export from the web platform.
          If you're self-hosting FieldKit, make sure your <InlineC>NEXTAUTH_URL</InlineC> is
          correctly set so the exported URL is reachable from the field.
        </p>

        <Callout>
          <strong>Note:</strong> The server URL is embedded in the config at export time. If you
          change your server's domain or IP, re-export and re-import the config. Existing queued
          responses will still sync to the old URL unless you update the server setting in the
          app's settings screen.
        </Callout>
      </section>

      {/* Collecting responses */}
      <section className="section mb-12 scroll-mt-12" id="collecting">
        <h2 className="mb-3 font-[var(--font-display)] text-[22px] font-semibold text-[var(--foreground)]">
          Collecting responses
        </h2>
        <p className="mb-4 max-w-[640px] text-[14px] leading-[1.55] text-[var(--foreground)]">
          Open a form from your forms list, fill in the fields, and submit. The response is saved
          to the local device immediately — you don't need a connection at any point.
        </p>

        <h3 className="mb-2 mt-5 text-[14px] font-semibold text-[var(--foreground)]">Offline submission flow</h3>
        <p className="mb-4 max-w-[640px] text-[14px] leading-[1.55] text-[var(--foreground)]">
          Each submission gets a unique <InlineC>submissionId</InlineC> (UUID) generated on the
          device. The response is stored in the local sync queue with its form ID, field data, and
          submission timestamp. The queue persists across app restarts — data is never lost even if
          the app is closed before syncing.
        </p>

        <h3 className="mb-2 mt-5 text-[14px] font-semibold text-[var(--foreground)]">File uploads</h3>
        <p className="mb-4 max-w-[640px] text-[14px] leading-[1.55] text-[var(--foreground)]">
          For file upload fields, tap to choose from the camera (take a photo) or gallery (select
          an existing image). Files are stored locally and uploaded to S3-compatible storage during
          sync. Supported types and size limits are defined in the form config — the app enforces
          them at selection time.
        </p>

        <h3 className="mb-2 mt-5 text-[14px] font-semibold text-[var(--foreground)]">Multiple submissions</h3>
        <p className="mb-4 max-w-[640px] text-[14px] leading-[1.55] text-[var(--foreground)]">
          If the form allows multiple submissions, you can submit it repeatedly — each submission
          is a separate entry with its own submission ID. If the form is set to single-submission
          only, the app enforces this locally.
        </p>
      </section>

      {/* Syncing responses */}
      <section className="section mb-12 scroll-mt-12" id="syncing">
        <h2 className="mb-3 font-[var(--font-display)] text-[22px] font-semibold text-[var(--foreground)]">
          Syncing responses
        </h2>
        <p className="mb-4 max-w-[640px] text-[14px] leading-[1.55] text-[var(--foreground)]">
          Syncing pushes locally collected responses to the web platform. You can sync
          manually or let the background engine handle it.
        </p>

        <h3 className="mb-2 mt-5 text-[14px] font-semibold text-[var(--foreground)]">Manual sync</h3>
        <Step num={1} title="Sync one form">
          On the forms list, each form card with pending responses shows a sync icon. Tap it to
          sync that form's queued responses. The app sends a batch POST to{' '}
          <InlineC>/api/mobile/responses</InlineC> with all pending submissions for that form.
        </Step>
        <Step num={2} title="Sync All">
          Tap <strong>Sync All</strong> at the top of the forms list to push every pending
          response across all forms at once. Each form's batch is sent independently.
        </Step>

        <h3 className="mb-2 mt-5 text-[14px] font-semibold text-[var(--foreground)]">Background sync engine</h3>
        <p className="mb-4 max-w-[640px] text-[14px] leading-[1.55] text-[var(--foreground)]">
          The app includes a background sync engine that monitors connectivity via{' '}
          <InlineC>NetInfo</InlineC>. When connectivity is restored after being offline, the
          engine automatically begins syncing queued responses. Failed batches are retried.
          The engine uses the form's mobile secret for authentication — no user login required
          on the mobile side.
        </p>

        <h3 className="mb-2 mt-5 text-[14px] font-semibold text-[var(--foreground)]">Deduplication</h3>
        <p className="mb-4 max-w-[640px] text-[14px] leading-[1.55] text-[var(--foreground)]">
          The server deduplicates by <InlineC>(formId, submissionId)</InlineC> using a database-level
          unique constraint. If a response is synced twice (network glitch, retry), the server
          ignores the duplicate and returns it in the <InlineC>duplicates</InlineC> count. The
          response body includes <InlineC>{'{ imported, duplicates }'}</InlineC> so the app can
          confirm what was received.
        </p>

        <Callout>
          <strong>Tip:</strong> If you see a form stuck with a "pending" status after syncing,
          check that the server URL in the mobile app's settings matches your FieldKit instance.
          If the server was redeployed or the domain changed, update the URL and re-sync.
        </Callout>
      </section>

      {/* Deleting a form */}
      <section className="section mb-12 scroll-mt-12" id="delete">
        <h2 className="mb-3 font-[var(--font-display)] text-[22px] font-semibold text-[var(--foreground)]">
          Deleting a form
        </h2>
        <p className="mb-4 max-w-[640px] text-[14px] leading-[1.55] text-[var(--foreground)]">
          Tap the trash icon on a form card in the mobile app to remove the form and its
          locally stored responses from your device. This only affects the local copy — it does
          not delete anything from the web platform.
        </p>

        <Callout>
          <strong>Before deleting:</strong> Make sure any pending responses have been synced.
          Deleting a form before syncing permanently removes those submissions from the device.
          The web platform won't have any record of them.
        </Callout>
      </section>
    </>
  )
}
