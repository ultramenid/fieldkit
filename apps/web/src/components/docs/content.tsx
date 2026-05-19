import { CodeBlock } from './code-block'
import { Callout } from './callout'
import { DataTable } from './data-table'

const DEFAULT_PORT = '3002'

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
    <ol className="mb-6 list-none p-0">
      {steps.map((step, i) => (
        <li
          key={step.title}
          className="relative border-b border-[var(--border)] py-4 pl-12 last:border-b-0"
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
    <div className="mb-6 rounded-[12px] border border-[var(--border)] bg-[var(--surface)] px-3 py-4 text-center md:px-4">
      <div className="overflow-x-auto">
        <div className="mx-auto flex min-w-max items-center justify-center gap-1.5 md:gap-2 whitespace-nowrap">
          <span className="rounded-full border border-[#8b4513] px-4 py-1.5 text-[12px] font-medium text-[#8b4513]">
            Serverside
          </span>
          <span className="text-[13px] text-[var(--muted)]">→ export config →</span>
          <span className="rounded-full border border-[var(--muted)] px-4 py-1.5 text-[12px] font-medium text-[var(--muted)]">
            Local Server
          </span>
          <span className="text-[13px] text-[var(--muted)]">→ export data →</span>
          <span className="rounded-full border border-[#8b4513] px-4 py-1.5 text-[12px] font-medium text-[#8b4513]">
            Serverside
          </span>
        </div>
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

      {/* Quickstart */}
      <section>
        <H2 id="quickstart">Quickstart (5 steps)</H2>
        <P>
          FieldKit has two components that work together: a cloud-hosted <strong>Serverside</strong> for
          building and managing forms, and a lightweight <strong>Local Server</strong> for offline data
          collection on local networks.
        </P>
        <Diagram />
        <OL>
          <li>
            <a href="#step-build" className="text-[var(--foreground)] underline underline-offset-2 hover:text-[var(--muted)]">
              Build form online
            </a>{' '}
            — create your form using the drag-and-drop builder
          </li>
          <li>
            <a href="#step-export" className="text-[var(--foreground)] underline underline-offset-2 hover:text-[var(--muted)]">
              Export config
            </a>{' '}
            — download the JSON config file from the dashboard
          </li>
          <li>
            <a href="#step-run-local" className="text-[var(--foreground)] underline underline-offset-2 hover:text-[var(--muted)]">
              Run local server
            </a>{' '}
            — install, start, and import your config via web UI
          </li>
          <li>
            <a href="#step-collect" className="text-[var(--foreground)] underline underline-offset-2 hover:text-[var(--muted)]">
              Collect offline responses
            </a>{' '}
            — field teams submit forms on the local network
          </li>
          <li>
            <a href="#step-sync" className="text-[var(--foreground)] underline underline-offset-2 hover:text-[var(--muted)]">
              Sync responses back
            </a>{' '}
            — export from local server and import into serverside
          </li>
        </OL>
      </section>

      {/* Step 1: Build */}
      <section>
        <H2 id="step-build">1. Build form online</H2>
        <P><strong>What:</strong> Create your form using the drag-and-drop builder on the serverside.</P>
        <P><strong>Why:</strong> The serverside is the master source for form definitions. All editing happens here.</P>
        <H3>Do this now</H3>
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
            ['Image upload', 'Photos, screenshots', 'JPG, PNG, WebP, GIF up to 10MB'],
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
          <li><strong>Export config</strong> — download a JSON config for the local server</li>
        </UL>
        <H3>Availability controls</H3>
        <DataTable
          headers={['Setting', 'Behavior']}
          rows={[
            ['Publish / unpublish', 'Draft forms are private; published forms accept responses'],
            ['Close / reopen form', 'Temporarily stop or resume new submissions'],
            ['Allow multiple submissions', 'Choose whether a device can submit once or multiple times'],
          ]}
        />
        <Callout title="Note">
          <p>
            Unpublishing or closing a form stops new submissions, but existing responses are preserved and
            still visible in the Responses table.
          </p>
        </Callout>
        <P><strong>Expected result:</strong> Your form is live and ready to share or export.</P>
      </section>

      {/* Step 2: Export */}
      <section>
        <H2 id="step-export">2. Export config</H2>
        <P><strong>What:</strong> Download your form as a JSON configuration file so the local server can serve it offline.</P>
        <P><strong>Why:</strong> The local server needs a config file to display your form — it cannot create forms, only serve them.</P>
        <H3>Do this now</H3>
        <H3>How to export</H3>
        <OL>
          <li>Go to the <strong>Dashboard</strong></li>
          <li>Click <strong>Share</strong> on the form you want to export</li>
          <li>Click <strong>Export for local server (.json)</strong></li>
          <li>A .json config file downloads to your machine</li>
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
        <P><strong>Expected result:</strong> A .json config file on your machine ready for the local server.</P>
      </section>

      {/* Step 3: Run local server */}
      <section>
        <H2 id="step-run-local">3. Run local server</H2>
        <P><strong>What:</strong> Install the local server package, start it, and import your config through the web UI.</P>
        <P><strong>Why:</strong> The local server serves your form on a local network so field teams can access it without internet.</P>
        <H3>Do this now</H3>
        <H3>System requirements</H3>
        <DataTable
          headers={['Requirement', 'Guidance', 'Notes']}
          rows={[
            ['Node.js', <IC key="n1">18+</IC>, 'Use an active LTS release when possible'],
            ['RAM', '256 MB+', 'More is helpful for larger response volumes'],
            ['Disk', '50 MB+', 'Allocate extra space for uploaded files and exports'],
            ['Network', 'LAN access', 'Devices must be on the same local network'],
          ]}
        />
        <H3>Install</H3>
        <CodeBlock>
          <span className="comment"># Install globally{'\n'}</span>
          <span className="cmd">npm install -g @malichamdan/fieldkit-local-server{'\n\n'}</span>
          <span className="comment"># Verify installation{'\n'}</span>
          <span className="cmd">fieldkit --version</span>
        </CodeBlock>
        <H3>Start the server</H3>
        <CodeBlock>
          <span className="comment"># Start on default port {DEFAULT_PORT}{'\n'}</span>
          <span className="cmd">fieldkit{'\n\n'}</span>
          <span className="comment"># Or use a custom port{'\n'}</span>
          <span className="cmd">fieldkit --port=8080</span>
        </CodeBlock>
        <P>Once running, the server prints local and LAN URLs in your terminal output.</P>
        <H3>Import config via web UI</H3>
        <OL>
          <li>Start the server with <IC>fieldkit</IC> (or <IC>fieldkit --port=3000</IC>)</li>
          <li>Open <IC>{`http://localhost:${DEFAULT_PORT}`}</IC> in your browser (or your custom port)</li>
          <li>Click <strong>Import Config</strong> and upload the JSON file exported from the serverside</li>
          <li>The form appears immediately in the admin panel and is ready to serve</li>
        </OL>
        <P>You can import multiple forms — each one gets its own URL path on the local network.</P>
        <Callout title="Important">
          <p>
            The local server cannot create or edit forms — it only serves forms that were built on the
            serverside and exported as config files. To update a form, edit it on the serverside,
            re-export, and re-import via the admin panel.
          </p>
        </Callout>
        <Callout title="Field deployment tip">
          <p>
            For field deployments, connect a portable Wi-Fi router to the machine running the local
            server. Respondents connect to the Wi-Fi and access the form URL directly — no internet
            needed.
          </p>
        </Callout>
        <P><strong>Expected result:</strong> The local server is running and your form is accessible at the LAN URL shown in the terminal.</P>
      </section>

      {/* Step 4: Collect */}
      <section>
        <H2 id="step-collect">4. Collect offline responses</H2>
        <P><strong>What:</strong> Field teams visit the local server URL on their devices and submit responses through the form.</P>
        <P><strong>Why:</strong> This is the core workflow — collecting data from the field where internet is unreliable or unavailable.</P>
        <H3>Do this now</H3>
        <OL>
          <li>Ensure the local server is running and devices are on the same network</li>
          <li>Share the LAN URL (e.g. <IC>{`http://192.168.1.50:${DEFAULT_PORT}`}</IC>) with field team members</li>
          <li>Field team members open the URL in any browser on their device</li>
          <li>Select the form from the list (if multiple forms are imported)</li>
          <li>Fill out and submit the form</li>
        </OL>
        <P><strong>Expected result:</strong> Responses are saved locally on the field machine in the SQLite database, accessible from the admin panel.</P>
      </section>

      {/* Step 5: Sync */}
      <section>
        <H2 id="step-sync">5. Sync responses back</H2>
        <P><strong>What:</strong> Export collected responses from the local server and import them into the serverside.</P>
        <P><strong>Why:</strong> Data flows one direction — from local servers back to the serverside where all responses are compiled for analysis.</P>
        <H3>Do this now</H3>
        <H3>Export from local server</H3>
        <P>Open the local server admin panel at <IC>{`http://localhost:${DEFAULT_PORT}`}</IC> (or your custom port):</P>
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
        <H3>Import into serverside</H3>
        <P>
          On the serverside <strong>Responses</strong> page for the same form, click{' '}
          <strong>Import local data</strong> and upload the exported JSON. The system merges local
          responses with online responses into one unified table.
        </P>
        <H3>Deduplication</H3>
        <P>
          Each response has a unique submission ID generated at the time of submission. When importing
          local data, the serverside checks these IDs and skips any duplicates — so you can safely
          import the same file multiple times without creating duplicate entries.
        </P>
        <H3>What does NOT sync back</H3>
        <P>
          Only response data syncs back. The form definition is managed exclusively on the serverside.
          If you need to update the form, edit it on the serverside and re-export the config to your
          local server.
        </P>
        <P><strong>Expected result:</strong> All responses — online and imported — visible in one unified table on the serverside Responses page.</P>
      </section>

      {/* Troubleshooting */}
      <section>
        <H2 id="troubleshooting">Troubleshooting</H2>
        <H3>Port already in use</H3>
        <CodeBlock>
          <span className="comment"># Use a different port{'\n'}</span>
          <span className="cmd">fieldkit --port=8080{'\n\n'}</span>
          <span className="comment"># Or kill the existing process (macOS/Linux){'\n'}</span>
          <span className="cmd">{`lsof -ti:${DEFAULT_PORT} | xargs kill`}</span>
        </CodeBlock>
        <H3>Devices can&apos;t connect</H3>
        <UL>
          <li>Ensure all devices are on the same network/subnet</li>
          <li>Check firewall settings — your configured server port (default {DEFAULT_PORT}) must be open for inbound connections</li>
          <li>On Windows, allow Node.js through Windows Firewall when prompted</li>
          <li>Try accessing via the IP address shown in the server output, not <IC>localhost</IC></li>
        </UL>
        <H3>Data not persisting</H3>
        <UL>
          <li>Check that <IC>~/.fieldkit/data</IC> exists and is writable by the current user</li>
          <li>Ensure the server wasn&apos;t killed with <IC>kill -9</IC> — use <IC>Ctrl+C</IC> for graceful shutdown</li>
          <li>Confirm the machine has enough free disk space for responses and uploaded files</li>
        </UL>
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
    </main>
  )
}
