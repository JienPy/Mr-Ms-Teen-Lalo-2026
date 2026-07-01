import { useSuspenseQuery } from "@tanstack/react-query";
import { Section } from "@/components/site/Section";
import { pageantPeopleQuery } from "@/lib/queries";
import { Reveal } from "@/components/luxury/Reveal";

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join("");
}

function PersonCard({ person }: { person: any }) {
  return (
    <Reveal className="w-40 sm:w-44 shrink-0">
      <article className="text-center w-full">
        <div className="mx-auto h-28 w-28 sm:h-32 sm:w-32 rounded-full overflow-hidden bg-(--secondary) ring-1 ring-(--gold)/35 grid place-items-center">
          {person.photo_url ? (
            <img src={person.photo_url} alt={person.name} className="h-full w-full object-cover" />
          ) : (
            <span className="font-display text-3xl sm:text-4xl text-gold-gradient">{initials(person.name)}</span>
          )}
        </div>
        <h3 className="mt-4 font-display text-lg sm:text-xl text-(--ivory) leading-tight">{person.name}</h3>
        {person.role && (
          <p className="mt-2 text-[10px] uppercase tracking-[0.22em] text-(--gold-soft)/75 leading-relaxed">
            {person.role}
          </p>
        )}
      </article>
    </Reveal>
  );
}

export function Officials() {
  const { data = [] } = useSuspenseQuery(pageantPeopleQuery);
  const sk = data.filter((person: any) => person.group_type === "sk");
  const organizers = data.filter((person: any) => person.group_type === "organizer");
  const mastersOfCeremony = data.filter((person: any) => person.group_type === "master_of_ceremony");

  if (sk.length === 0 && organizers.length === 0 && mastersOfCeremony.length === 0) return null;

  return (
    <>
      {sk.length > 0 && (
        <Section id="officials" eyebrow="Sangguniang Kabataan" title="SK Barangay Lalo Officials">
          <div className="flex flex-wrap justify-center gap-x-10 gap-y-12 max-w-6xl mx-auto">
            {sk.map((person: any) => <PersonCard key={person.id} person={person} />)}
          </div>
        </Section>
      )}

      {organizers.length > 0 && (
        <Section id="organizers" eyebrow="Production Team" title="Organizers">
          <div className="flex flex-wrap justify-center gap-x-10 gap-y-12 max-w-5xl mx-auto">
            {organizers.map((person: any) => <PersonCard key={person.id} person={person} />)}
          </div>
        </Section>
      )}

      {mastersOfCeremony.length > 0 && (
        <Section id="masters-of-ceremony" eyebrow="Program Hosts" title="Master of Ceremony">
          <div className="flex flex-wrap justify-center gap-x-10 gap-y-12 max-w-5xl mx-auto">
            {mastersOfCeremony.map((person: any) => <PersonCard key={person.id} person={person} />)}
          </div>
        </Section>
      )}
    </>
  );
}
