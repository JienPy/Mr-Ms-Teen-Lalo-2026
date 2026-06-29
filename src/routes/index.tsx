import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/site/Navbar";
import { Hero } from "@/components/site/Hero";
import { Section } from "@/components/site/Section";
import { Leaderboard } from "@/components/site/Leaderboard";
import { Candidates } from "@/components/site/Candidates";
import { Announcements } from "@/components/site/Announcements";
import { Gallery } from "@/components/site/Gallery";
import { Videos } from "@/components/site/Videos";
import { Tickets } from "@/components/site/Tickets";
import { Sponsors } from "@/components/site/Sponsors";
import { Footer } from "@/components/site/Footer";
import { settingsQuery } from "@/lib/queries";
import { Reveal } from "@/components/luxury/Reveal";

export const Route = createFileRoute("/")({
  loader: ({ context }) => context.queryClient.ensureQueryData(settingsQuery),
  component: Home,
});

function Home() {
  const { data: settings } = useSuspenseQuery(settingsQuery);
  const event = settings.event ?? { date: "2026-08-30", time: "6:00 PM onwards", venue: "Silungang Bayan" };
  const about = settings.about ?? { body: "" };
  const ticket = settings.ticket ?? { price: 50, terms: [] };
  const socials = settings.socials ?? {};
  const ticketImage = settings.ticketImage?.url;

  const targetIso = `${event.date}T18:00:00+08:00`;

  return (
    <div className="relative min-h-screen text-(--ivory)">
      <Navbar />
      <main>
        <Hero targetIso={targetIso} venue={event.venue} time={event.time} />

        <Section id="announcements" eyebrow="Latest Updates" title="Announcements">
          <Announcements />
        </Section>

        <Section id="about" eyebrow="About the Pageant" title="A Celebration of Youth & Service">
          <Reveal>
            <p className="max-w-3xl mx-auto text-center font-serif text-xl text-(--ivory)/85 leading-relaxed">
              {about.body}
            </p>
          </Reveal>
        </Section>

        <Section id="leaderboard" eyebrow="Weekly Standings" title="Top 7 of the Week" subtitle="Confidential ticket counts. Only percentages are public.">
          <Leaderboard />
        </Section>

        <Section id="candidates" eyebrow="The Royals" title="Meet the Candidates">
          <Candidates />
        </Section>

        <Section id="gallery" eyebrow="Event Moments" title="Gallery">
          <Gallery />
        </Section>

        <Section id="videos" eyebrow="Teasers & Reels" title="Videos">
          <Videos />
        </Section>

        <Section id="tickets" eyebrow="Join the Gala" title="Get Your Ticket">
          <Tickets price={ticket.price} terms={ticket.terms} ticketImage={ticketImage} />
        </Section>

        <Sponsors />
      </main>
      <Footer socials={socials} />
    </div>
  );
}
