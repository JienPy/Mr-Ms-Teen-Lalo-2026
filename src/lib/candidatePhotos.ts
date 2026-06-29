export type CandidatePhoto = {
  id: string;
  candidate_id: string;
  image_url: string;
  caption?: string | null;
  is_main_portrait?: boolean;
  show_in_profile?: boolean;
  show_in_top7?: boolean;
  sort_order?: number | null;
};

export function photosForCandidate(photos: CandidatePhoto[] | undefined, candidateId: string) {
  return (photos ?? [])
    .filter((photo) => photo.candidate_id === candidateId)
    .sort((a, b) => (Number(a.sort_order) || 0) - (Number(b.sort_order) || 0));
}

export function mainPortraitFor(candidate: any, photos: CandidatePhoto[] | undefined) {
  const candidatePhotos = photosForCandidate(photos, candidate.id ?? candidate.candidate_id);
  return candidatePhotos.find((photo) => photo.is_main_portrait)?.image_url ?? candidate.photo_url ?? null;
}

export function profileGalleryFor(candidate: any, photos: CandidatePhoto[] | undefined) {
  return photosForCandidate(photos, candidate.id ?? candidate.candidate_id).filter((photo) => photo.show_in_profile);
}

export function top7PhotosFor(candidate: any, photos: CandidatePhoto[] | undefined) {
  return photosForCandidate(photos, candidate.id ?? candidate.candidate_id).filter((photo) => photo.show_in_top7);
}

export function top7ImageFor(candidate: any, photos: CandidatePhoto[] | undefined) {
  const top7Photo = top7PhotosFor(candidate, photos)[0]?.image_url;
  return top7Photo ?? mainPortraitFor(candidate, photos);
}
