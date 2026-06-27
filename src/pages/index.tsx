import Head from "next/head";
import MainLayout from "@/layouts/MainLayout";
import Section from "@/components/ui/Section";

export default function Home() {
  return (
    <>
      <Head>
        <title>Wedding Invitation</title>
        <meta name="description" content="Our wedding invitation" />
        <meta property="og:title" content="Wedding Invitation" />
        <meta property="og:description" content="Our wedding invitation" />
        <meta property="og:type" content="website" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <MainLayout>
        <Section className="flex min-h-screen items-center justify-center text-center">
          <div className="animate-fade-up">
            <p className="mb-3 text-sm uppercase tracking-[0.3em] text-gold">
              Save the date
            </p>
            <h1 className="text-4xl font-semibold sm:text-6xl">
              Bride &amp; Groom
            </h1>
            <p className="mt-4 text-ink/60">
              The wedding invitation is being prepared.
            </p>
          </div>
        </Section>
      </MainLayout>
    </>
  );
}
