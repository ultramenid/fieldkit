import { CodeBlock } from '@/components/docs/code-block'

export default function DocsPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-6 text-4xl font-bold tracking-tight text-black">
        FieldKit Documentation
      </h1>
      <p className="mb-12 text-lg text-gray-600">
        Learn how to use FieldKit for offline form collection in the field.
      </p>

      <section id="overview" className="mb-16 scroll-mt-24">
        <h2 className="mb-4 text-2xl font-semibold text-black">Overview</h2>
        <p className="mb-4 text-gray-700 leading-relaxed">
          FieldKit is a form builder designed for NGOs and field teams working in areas with unreliable internet connectivity. 
          It allows you to create forms online, then collect responses offline using mobile devices or local servers.
        </p>
        <p className="text-gray-700 leading-relaxed">
          Data flows one-way: forms are designed on the web, then deployed to offline clients. 
          Responses are collected offline and synced back when connectivity returns.
        </p>
      </section>

      <section id="quickstart" className="mb-16 scroll-mt-24">
        <h2 className="mb-4 text-2xl font-semibold text-black">Quick Start</h2>
        <p className="mb-6 text-gray-700 leading-relaxed">
          Get started with FieldKit in minutes. Install the CLI and create your first project.
        </p>
        <CodeBlock language="bash">
{`npm install -g @fieldkit/cli
fieldkit init my-project
cd my-project
fieldkit dev`}
        </CodeBlock>
      </section>

      <section id="installation" className="mb-16 scroll-mt-24">
        <h2 className="mb-4 text-2xl font-semibold text-black">Installation</h2>
        <p className="mb-6 text-gray-700 leading-relaxed">
          Install FieldKit on your local machine. Requires Node.js 18 or later.
        </p>
        <CodeBlock language="bash">
{`# Using npm
npm install -g @fieldkit/cli

# Using yarn
yarn global add @fieldkit/cli

# Using pnpm
pnpm add -g @fieldkit/cli`}
        </CodeBlock>
      </section>

      <section id="web-setup" className="mb-16 scroll-mt-24">
        <h2 className="mb-4 text-2xl font-semibold text-black">Web Setup</h2>
        <p className="mb-6 text-gray-700 leading-relaxed">
          Configure the web application for form building and management.
        </p>
        <CodeBlock language="bash">
{`# Clone the repository
git clone https://github.com/fieldkit/web.git
cd web

# Install dependencies
npm install

# Start development server
npm run dev`}
        </CodeBlock>
      </section>

      <section id="local-server" className="mb-16 scroll-mt-24">
        <h2 className="mb-4 text-2xl font-semibold text-black">Local Server</h2>
        <p className="mb-6 text-gray-700 leading-relaxed">
          Run FieldKit locally for offline form collection. The local server stores responses 
          in SQLite and syncs them when connectivity returns.
        </p>
        <CodeBlock language="bash">
{`# Start the local server
fieldkit serve

# The server will be available at http://localhost:3000
# Forms are cached locally for offline use`}
        </CodeBlock>
      </section>

      <section id="mobile-app" className="mb-16 scroll-mt-24">
        <h2 className="mb-4 text-2xl font-semibold text-black">Mobile App</h2>
        <p className="mb-6 text-gray-700 leading-relaxed">
          Use FieldKit on mobile devices for field data collection. The mobile app works 
          completely offline and syncs responses when back online.
        </p>
        <CodeBlock language="bash">
{`# Install the mobile app
npm install @fieldkit/mobile

# Build for iOS
npx expo run:ios

# Build for Android
npx expo run:android`}
        </CodeBlock>
      </section>

      <section id="api-reference" className="mb-16 scroll-mt-24">
        <h2 className="mb-4 text-2xl font-semibold text-black">API Reference</h2>
        <p className="mb-6 text-gray-700 leading-relaxed">
          API documentation for developers integrating with FieldKit.
        </p>
        <CodeBlock language="typescript">
{`// Create a new form
const form = await fieldkit.createForm({
  title: 'Survey',
  fields: [
    { type: 'text', label: 'Name' },
    { type: 'number', label: 'Age' }
  ]
});

// Collect response
const response = await form.collect({
  name: 'John Doe',
  age: 30
});

// Sync when online
await fieldkit.sync();`}
        </CodeBlock>
      </section>
    </div>
  )
}
