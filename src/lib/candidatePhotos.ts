export type CandidatePhoto = {
  id: string;
  candidate_id: string;
  image_url: string;
  caption?: string | null;
  is_main_portrait?: boolean;
  show_in_profile?: boolean;
  show_in_top7?: boolean;
  top7_zoom?: number | null;
  top7_offset_x?: number | null;
  top7_offset_y?: number | null;
  top7_crop_url?: string | null;
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

export function top7PhotoFor(candidate: any, photos: CandidatePhoto[] | undefined) {
  const candidatePhotos = photosForCandidate(photos, candidate.id ?? candidate.candidate_id);
  return candidatePhotos.find((photo) => photo.show_in_top7) ?? candidatePhotos.find((photo) => photo.is_main_portrait);
}

export function top7ImageFor(candidate: any, photos: CandidatePhoto[] | undefined) {
  return top7PhotoFor(candidate, photos)?.image_url ?? candidate.photo_url ?? null;
}
