import { CodeBlock } from './code-block'
import { Callout } from './callout'
import { DataTable } from './data-table'

function H2({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h2
      id={id}
      className="mb-4 mt-12 border-t border-[var(--border)] pt-6 font-sans text-[22px] font-medium leading-snug text-[var(--foreground)] first:mt-0 first:border-t-0 first:pt-0"
    >
      {children}
    </h2>
  )
}

function H3({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="mb-3 mt-8 text-[16px] font-medium text-[var(--foreground)]">{children}</h3>
  )
}

function P({ children }: { children: React.ReactNode }) {
  return <p className="mb-4 text-[var(--foreground)]">{children}</p>
}

function UL({ children }: { children: React.ReactNode }) {
  return <ul className="mb-4 list-disc pl-6 text-[var(--foreground)] [&_li]:mb-2">{children}</ul>
}

function OL({ children }: { children: React.ReactNode }) {
  return <ol className="mb-4 list-decimal pl-6 text-[var(--foreground)] [&_li]:mb-2">{children}</ol>
}

function IC({ children }: { children: React.ReactNode }) {
  return (
    <code className="rounded px-1.5 py-0.5 font-mono text-[13px] bg-[var(--surface)] text-[var(--foreground)]">
      {children}
    </code>
  )
}

function StepList({ steps }: { steps: { title: string; body: React.ReactNode }[] }) {
  return (
    <ol className="mb-6 list-none p-0" style={{ counterReset: 'steps' }}>
      {steps.map((step, i) => (
        <li
          key={i}
          className="relative border-b border-[var(--border)] py-4 pl-12 last:border-b-0"
          style={{ counterIncrement: 'steps' }}
        >
          <span className="absolute left-0 top-4 grid h-8 w-8 place-items-center rounded-full border border-[var(--border)] bg-[var(--surface)] font-mono text-[13px] font-medium text-[var(--foreground)]">
            {i + 1}
          </span>
          <strong className="mb-1 block text-[var(--foreground)]">{step.title}</strong>
          <span className="text-[14px] text-[var(--muted)]">{step.body}</span>
        </li>
      ))}
    </ol>
  )
}

function Diagram() {
  return (
    <div className="mb-6 rounded-[12px] border border-[var(--border)] bg-[var(--surface)] p-8 text-center">
      <div className="flex flex-wrap items-center justify-center gap-3">
        <span className="rounded-full border border-[#16a34a] px-[18px] py-2.5 text-[13px] font-medium text-[#16a34a]">
          Serverside
        </span>
        <span className="text-[18px] text-[var(--muted)]">→ export config →</span>
        <span className="rounded-full border border-[#b45309] px-[18px] py-2.5 text-[13px] font-medium text-[#b45309]">
          Local Server
        </span>
        <span className="text-[18px] text-[var(--muted)]">→ export data →</span>
        <span className="rounded-full border border-[#16a34a] px-[18px] py-2.5 text-[13px] font-medium text-[#16a34a]">
          Serverside
        </span>
      </div>
    </div>
  )
}

export function DocsContent() {
  return (
    <main className="max-w-[720px] px-12 py-10 text-[var(--foreground)] max-md:px-6 max-md:py-6">
      <h1 id="overview" className="mb-2 font-sans text-[32px] font-medium leading-tight text-[var(--foreground)]">
        Documentation
      </h1>
      <p className="mb-10 text-[17px] text-[var(--muted)]">
        Everything you need to build forms online and collect data offline.
      </p>

      {/* How it works */}
      <section>
        <H2 id="how-it-works">How it works</H2>
        <P>
          FieldKit has two components that work together: a cloud-hosted <strong>Serverside</strong> for
          building and managing forms, and a lightweight <strong>Local Server</strong> for offline data
          collection on local networks.
        </P>
        <Diagram />
        <StepList
          steps={[
            {
              title: 'Build your form online',
              body: 'Use the drag-and-drop form builder on the serverside to create fields, set validation rules, and configure settings.',
            },
            {
              title: 'Export as config file',
              body: 'Download the form as a JSON configuration file from the dashboard or builder.',
            },
            {
              title: 'Install & start the Local Server',
              body: (
                <>
                  Run <IC>npm install -g @fieldkit/local-server</IC> then <IC>fieldkit serve</IC>. The
                  admin panel opens at <IC>http://localhost:3000</IC>.
                </>
              ),
            },
            {
              title: 'Import config via the web UI',
              body: 'Open the local server admin panel in your browser and upload the config JSON file. No terminal commands needed for import — just drag and drop.',
            },
            {
              title: 'Collect responses offline',
              body: 'Field teams access the form via the local network — no internet required.',
            },
            {
              title: 'Export response data & sync back',
              body: 'Export collected responses (not the form config) from the local server admin panel and import them into the serverside. The form master stays on the serverside — only response data flows back.',
            },
          ]}
        />
      </section>

      {/* Quickstart */}
      <section>
        <H2 id="quickstart">Quickstart</H2>
        <H3>Serverside (cloud)</H3>
        <P>
          Sign in with your Google account at <IC>app.fieldkit.io</IC> and create your first form from
          the dashboard.
        </P>
        <H3>Local Server (offline)</H3>
        <P>
          The local server <strong>only serves forms</strong> — it does not create them. You build forms
          on the serverside, export the config, then import it through the local server&apos;s web UI.
        </P>
        <CodeBlock>
          <span className="comment"># 1. Install globally{'\n'}</span>
          <span className="cmd">npm install -g @fieldkit/local-server{'\n\n'}</span>
          <span className="comment"># 2. Start the server{'\n'}</span>
          <span className="cmd">fieldkit serve{'\n\n'}</span>
          <span className="comment"># Server running at http://localhost:3000{'\n'}</span>
          <span className="comment"># Open the admin panel in your browser to import configs</span>
        </CodeBlock>
        <P>
          Once the server is running, open <IC>http://localhost:3000</IC> in your browser. Use the{' '}
          <strong>Import Config</strong> button to upload the JSON file exported from the serverside. No
          terminal commands needed for import.
        </P>
        <Callout title="Important">
          <p>
            The local server cannot create or edit forms — it only serves forms that were built on the
            serverside and exported as config files. To update a form, edit it on the serverside,
            re-export, and re-import via the admin panel.
          </p>
        </Callout>
      </section>

      {/* Create a Form */}
      <section>
        <H2 id="create-form">Create a Form</H2>
        <P>
          The form builder is a drag-and-drop editor where you assemble fields, configure validation,
          and preview the final result — all from your browser.
        </P>
        <H3>Starting a new form</H3>
        <OL>
          <li>From the <strong>Dashboard</strong>, click <strong>New form</strong></li>
          <li>Give your form a title (e.g. &quot;Community Health Survey&quot;)</li>
          <li>The builder opens with an empty canvas</li>
        </OL>
        <H3>Adding fields</H3>
        <P>Click any field type from the left sidebar to add it to your form:</P>
        <DataTable
          headers={['Field type', 'Use case', 'Options']}
          rows={[
            ['Text input', 'Names, short answers', 'Min/max length, regex pattern'],
            ['Email', 'Contact information', 'Auto-validates email format'],
            ['Number', 'Age, quantities, scores', 'Min/max value, step'],
            ['Long text', 'Comments, descriptions', 'Min/max length, character counter'],
            ['Dropdown', 'Single selection from many options', 'Custom option list'],
            ['Single choice', 'One answer from few options', 'Radio buttons, custom options'],
            ['Multiple choice', 'Select all that apply', 'Checkboxes, min/max selections'],
            ['Date', 'Dates of birth, event dates', 'Min/max date range'],
            ['File upload', 'Documents, photos', 'Allowed types, max size'],
            ['Rating', 'Satisfaction, quality scores', 'Star count (1–10)'],
          ]}
        />
        <H3>Configuring fields</H3>
        <P>Click any field on the canvas to open its settings panel on the right:</P>
        <UL>
          <li><strong>Label</strong> — the question text shown to respondents</li>
          <li><strong>Placeholder</strong> — hint text inside the input</li>
          <li><strong>Help text</strong> — optional description below the field</li>
          <li><strong>Required</strong> — toggle to make the field mandatory</li>
          <li><strong>Validation</strong> — min/max length, regex patterns, number ranges</li>
        </UL>
        <H3>Reordering fields</H3>
        <P>
          Hover over a field to reveal the drag handle on the left. Drag fields up or down to reorder
          them. The form preview updates in real time.
        </P>
        <Callout title="Tip">
          <p>
            Use the <strong>Preview</strong> button in the top bar to see exactly what respondents will
            see. The preview opens in a new tab with the published form layout.
          </p>
        </Callout>
      </section>

      {/* Share & Publish */}
      <section>
        <H2 id="share-form">Share &amp; Publish</H2>
        <P>Once your form is ready, publish it to make it accessible online or export it for local use.</P>
        <H3>Publishing online</H3>
        <OL>
          <li>Click <strong>Publish</strong> in the builder top bar</li>
          <li>Your form goes live at <IC>app.fieldkit.io/f/{'{form-id}'}</IC></li>
          <li>Share the link with respondents via email, messaging, or QR code</li>
        </OL>
        <H3>Sharing options</H3>
        <P>From the Dashboard, click the <strong>Share</strong> button on any form to access:</P>
        <UL>
          <li><strong>Direct link</strong> — copy the form URL to clipboard</li>
          <li><strong>QR code</strong> — download a QR code image for printing</li>
          <li><strong>Embed code</strong> — HTML snippet to embed the form in another website</li>
          <li><strong>Email invite</strong> — send the form link to a list of email addresses</li>
        </UL>
        <H3>Access control</H3>
        <DataTable
          headers={['Setting', 'Behavior']}
          rows={[
            ['Public', 'Anyone with the link can submit'],
            ['One response per device', 'Uses browser fingerprint to prevent duplicates'],
            ['Require email', 'Respondent must enter email before accessing the form'],
            ['Close after date', 'Form stops accepting responses after a set date'],
            ['Close after count', 'Form closes after N responses received'],
          ]}
        />
        <Callout title="Note">
          <p>
            Unpublishing a form immediately stops accepting new responses. Existing responses are
            preserved and still visible in the Responses table.
          </p>
        </Callout>
      </section>

      {/* Export Config */}
      <section>
        <H2 id="export-config">Export Config</H2>
        <P>Export your form as a JSON configuration file so the Local Server can serve it offline.</P>
        <H3>How to export</H3>
        <OL>
          <li>Go to the <strong>Dashboard</strong></li>
          <li>Click the <strong>⋯</strong> menu on the form you want to export</li>
          <li>Select <strong>Export config</strong></li>
          <li>A <IC>.json</IC> file downloads to your machine</li>
        </OL>
        <H3>What&apos;s included in the config</H3>
        <UL>
          <li>Form title, description, and settings</li>
          <li>All field definitions with labels, types, options, and validation rules</li>
          <li>Submit button text and success message</li>
          <li>Form version number (for tracking updates)</li>
        </UL>
        <H3>What&apos;s NOT included</H3>
        <UL>
          <li>Existing responses (those stay on the serverside)</li>
          <li>User account information</li>
          <li>Analytics or view counts</li>
        </UL>
        <H3>Updating a form on the local server</H3>
        <P>
          If you edit a form after exporting, re-export the config and re-import it on the local server
          via the admin panel. The local server detects the version number and updates the form
          definition while preserving any collected responses.
        </P>
        <Callout title="Version tracking">
          <p>
            Each export increments the form&apos;s <IC>version</IC> field. The local server shows which
            version it&apos;s running so you can verify it matches the latest serverside version.
          </p>
        </Callout>
      </section>

      {/* View Responses */}
      <section>
        <H2 id="responses">View Responses</H2>
        <P>
          The Responses page shows a real-time table of all submissions — both online and imported from
          local servers.
        </P>
        <H3>Response table features</H3>
        <UL>
          <li><strong>Real-time updates</strong> — new online submissions appear instantly</li>
          <li><strong>Source column</strong> — shows whether each response came from &quot;Online&quot; or &quot;Local server&quot;</li>
          <li><strong>Search</strong> — full-text search across all fields</li>
          <li><strong>Filter by source</strong> — view only online or only local responses</li>
          <li><strong>Sort by column</strong> — click any column header to sort</li>
          <li><strong>Timestamps</strong> — each response shows when it was submitted</li>
        </UL>
        <H3>Importing local data</H3>
        <OL>
          <li>Export responses from the local server admin panel (JSON format)</li>
          <li>On the serverside Responses page, click <strong>Import local data</strong></li>
          <li>Upload the JSON file</li>
          <li>The system merges responses, deduplicating by submission ID</li>
        </OL>
        <H3>Exporting final data</H3>
        <P>Click <strong>Export</strong> on the Responses page to download all compiled data:</P>
        <DataTable
          headers={['Format', 'Best for']}
          rows={[
            ['CSV', 'Spreadsheets (Excel, Google Sheets)'],
            ['JSON', 'Programmatic processing, databases'],
            ['XLSX', 'Excel with formatting preserved'],
          ]}
        />
        <Callout title="Deduplication">
          <p>
            Each response has a unique submission ID generated at the time of submission. When importing
            local data, the serverside checks these IDs and skips any duplicates — so you can safely
            import the same file multiple times without creating duplicate entries.
          </p>
        </Callout>
      </section>

      {/* Installation */}
      <section>
        <H2 id="install">Local Server Installation</H2>
        <P>
          The local server runs on any machine with Node.js 18+ installed. It works on Windows, macOS,
          and Linux.
        </P>
        <H3>System requirements</H3>
        <DataTable
          headers={['Requirement', 'Minimum', 'Recommended']}
          rows={[
            ['Node.js', <IC key="n1">18.0.0</IC>, <IC key="n2">20.x LTS</IC>],
            ['RAM', '256 MB', '512 MB'],
            ['Disk', '50 MB', '200 MB'],
            ['Network', 'LAN access', 'LAN + Wi-Fi AP'],
          ]}
        />
        <H3>Install on Windows</H3>
        <CodeBlock>
          <span className="comment"># Using PowerShell (run as Administrator){'\n'}</span>
          <span className="cmd">npm install -g @fieldkit/local-server{'\n\n'}</span>
          <span className="comment"># Verify installation{'\n'}</span>
          <span className="cmd">fieldkit --version</span>
        </CodeBlock>
        <H3>Install on macOS / Linux</H3>
        <CodeBlock>
          <span className="cmd">npm install -g @fieldkit/local-server{'\n\n'}</span>
          <span className="comment"># Or with sudo if needed{'\n'}</span>
          <span className="cmd">sudo npm install -g @fieldkit/local-server</span>
        </CodeBlock>
        <H3>Install via Docker</H3>
        <CodeBlock>
          <span className="cmd">docker pull fieldkit/local-server:latest{'\n'}</span>
          <span className="cmd">docker run -d -p 3000:3000 -v ./config:/app/config fieldkit/local-server</span>
        </CodeBlock>
      </section>

      {/* Setup */}
      <section>
        <H2 id="setup">Setup &amp; Configuration</H2>
        <H3>Import form configs</H3>
        <P>
          The local server requires at least one form config to serve. Import configs through the admin
          web UI — no terminal commands needed:
        </P>
        <OL>
          <li>Start the server with <IC>fieldkit serve</IC></li>
          <li>Open <IC>http://localhost:3000</IC> in your browser</li>
          <li>Click <strong>Import Config</strong> and upload the JSON file exported from the serverside</li>
          <li>The form appears immediately in the admin panel and is ready to serve</li>
        </OL>
        <P>You can import multiple forms — each one gets its own URL path on the local network.</P>
        <H3>Configuration options</H3>
        <P>
          Server settings are managed through the admin panel or via <IC>fieldkit.config.json</IC> in
          the working directory:
        </P>
        <CodeBlock>
          {`{
  "port": 3000,
  "host": "0.0.0.0",
  "dataDir": "./data",
  "forms": ["./community-health-survey.json"],
  "auth": {
    "enabled": false,
    "pin": null
  },
  "export": {
    "format": "csv",
    "autoBackup": true,
    "backupInterval": "1h"
  }
}`}
        </CodeBlock>
        <DataTable
          headers={['Option', 'Default', 'Description']}
          rows={[
            [<IC key="p">port</IC>, <IC key="p2">3000</IC>, 'Port the server listens on'],
            [<IC key="h">host</IC>, <IC key="h2">0.0.0.0</IC>, 'Bind address (0.0.0.0 = all interfaces)'],
            [<IC key="d">dataDir</IC>, <IC key="d2">./data</IC>, 'Where responses are stored locally'],
            [<IC key="a">auth.enabled</IC>, <IC key="a2">false</IC>, 'Require PIN to access admin panel'],
            [<IC key="ap">auth.pin</IC>, <IC key="ap2">null</IC>, '4-digit PIN for admin access'],
            [<IC key="ef">export.format</IC>, <IC key="ef2">csv</IC>, 'Export format: csv, json, or xlsx'],
            [<IC key="ab">export.autoBackup</IC>, <IC key="ab2">true</IC>, 'Auto-backup responses to disk'],
          ]}
        />
      </section>

      {/* Running */}
      <section>
        <H2 id="run">Running the Local Server</H2>
        <P>Start the server, then import configs through the web UI.</P>
        <CodeBlock>
          <span className="comment"># Start the local server{'\n'}</span>
          <span className="cmd">fieldkit serve{'\n\n'}</span>
          <span className="comment"># Start with custom port{'\n'}</span>
          <span className="cmd">fieldkit serve --port 8080{'\n\n'}</span>
          <span className="comment"># Start with PIN protection{'\n'}</span>
          <span className="cmd">fieldkit serve --pin 1234{'\n\n'}</span>
          <span className="comment"># Run in background (Linux/macOS){'\n'}</span>
          <span className="cmd">fieldkit serve --daemon</span>
        </CodeBlock>
        <P>Once running, the server displays:</P>
        <CodeBlock>
          {`┌─────────────────────────────────────────┐
│  FieldKit Local Server v1.2.0           │
│                                         │
│  Form:    Community Health Survey       │
│  Status:  Running                       │
│                                         │
│  Local:   http://localhost:3000         │
│  Network: http://192.168.1.100:3000    │
│                                         │
│  Responses: 0 collected                 │
│  Uptime:    0m                          │
└─────────────────────────────────────────┘`}
        </CodeBlock>
        <Callout title="Field deployment tip">
          <p>
            For field deployments, connect a portable Wi-Fi router to the machine running the local
            server. Respondents connect to the Wi-Fi and access the form URL directly — no internet
            needed.
          </p>
        </Callout>
      </section>

      {/* Sync */}
      <section>
        <H2 id="sync">Sync Response Data Back</H2>
        <P>
          The local server only collects <strong>response data</strong> — it never modifies the form
          itself. The form master always lives on the serverside.
        </P>
        <H3>Export responses from local server (web UI)</H3>
        <P>Open the local server admin panel at <IC>http://localhost:3000</IC>:</P>
        <OL>
          <li>Go to the <strong>Responses</strong> tab for the form</li>
          <li>Click <strong>Export Data</strong> in the top-right</li>
          <li>Choose your format:</li>
        </OL>
        <DataTable
          headers={['Format', 'Use case']}
          rows={[
            ['JSON', 'Import into serverside to compile with online responses'],
            ['CSV', 'Open in Excel, Google Sheets, or other spreadsheet tools'],
            ['JSON + metadata', 'Includes timestamps, device info, and submission IDs for full audit trail'],
          ]}
        />
        <P>The file downloads to your device — no terminal commands needed.</P>
        <H3>Import responses into serverside</H3>
        <P>
          On the serverside <strong>Responses</strong> page for the same form, click{' '}
          <strong>Import local data</strong> and upload the exported JSON. The system merges local
          responses with online responses into one unified table.
        </P>
        <H3>Deduplication</H3>
        <P>
          Each response carries a unique submission ID generated at collection time. Re-importing the
          same file won&apos;t create duplicates — the serverside skips any submission ID it already has.
        </P>
        <H3>What does NOT sync back</H3>
        <P>
          Only response data syncs back. The form definition is managed exclusively on the serverside.
          If you need to update the form, edit it on the serverside and re-export the config to your
          local server.
        </P>
      </section>

      {/* Config format */}
      <section>
        <H2 id="config-format">Config File Format</H2>
        <P>The exported config file contains the full form definition:</P>
        <CodeBlock>
          {`{
  "id": "form_abc123",
  "title": "Community Health Survey",
  "description": "Assess community health needs",
  "version": 2,
  "fields": [
    {
      "id": "f1",
      "type": "text",
      "label": "Full name",
      "required": true,
      "placeholder": "Enter your full name",
      "validation": { "minLength": 2, "maxLength": 100 }
    },
    {
      "id": "f2",
      "type": "select",
      "label": "District",
      "required": true,
      "options": ["Kigali", "Eastern", "Western", "Northern", "Southern"]
    }
  ],
  "settings": {
    "submitLabel": "Submit response",
    "successMessage": "Thank you for your response",
    "allowMultiple": false
  }
}`}
        </CodeBlock>
      </section>

      {/* API */}
      <section>
        <H2 id="api">API Endpoints</H2>
        <P>The local server exposes a simple REST API for programmatic access:</P>
        <DataTable
          headers={['Method', 'Endpoint', 'Description']}
          rows={[
            [<IC key="g1">GET</IC>, <IC key="e1">/api/forms</IC>, 'List all loaded forms'],
            [<IC key="g2">GET</IC>, <IC key="e2">/api/forms/:id</IC>, 'Get form definition'],
            [<IC key="p1">POST</IC>, <IC key="e3">/api/forms/:id/submit</IC>, 'Submit a response'],
            [<IC key="g3">GET</IC>, <IC key="e4">/api/responses/:formId</IC>, 'List responses (admin)'],
            [<IC key="g4">GET</IC>, <IC key="e5">/api/export/:formId</IC>, 'Export responses'],
            [<IC key="g5">GET</IC>, <IC key="e6">/api/status</IC>, 'Server health check'],
          ]}
        />
      </section>

      {/* Troubleshooting */}
      <section>
        <H2 id="troubleshooting">Troubleshooting</H2>
        <H3>Port already in use</H3>
        <CodeBlock>
          <span className="comment"># Use a different port{'\n'}</span>
          <span className="cmd">fieldkit serve --port 8080{'\n\n'}</span>
          <span className="comment"># Or kill the existing process (macOS/Linux){'\n'}</span>
          <span className="cmd">lsof -ti:3000 | xargs kill</span>
        </CodeBlock>
        <H3>Devices can&apos;t connect</H3>
        <UL>
          <li>Ensure all devices are on the same network/subnet</li>
          <li>Check firewall settings — port 3000 must be open for inbound connections</li>
          <li>On Windows, allow Node.js through Windows Firewall when prompted</li>
          <li>Try accessing via the IP address shown in the server output, not <IC>localhost</IC></li>
        </UL>
        <H3>Data not persisting</H3>
        <UL>
          <li>Check that the <IC>dataDir</IC> path exists and is writable</li>
          <li>Ensure the server wasn&apos;t killed with <IC>kill -9</IC> — use <IC>Ctrl+C</IC> for graceful shutdown</li>
          <li>Enable <IC>autoBackup</IC> in config for periodic disk writes</li>
        </UL>
      </section>
    </main>
  )
}
