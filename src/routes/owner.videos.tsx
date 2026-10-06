import { createFileRoute } from '@tanstack/react-router';
import { useState, useMemo } from 'react';
import {
  Video,
  Upload,
  Plus,
  Trash2,
  Play,
  Film,
  Building2,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { Badge, Button, SectionHeading } from '@/components/ui';
import { useAuthStore } from '@/store/useAuthStore';
import { useOwnerStore } from '@/store/useOwnerStore';
import type { Turf } from '@/types';

export const Route = createFileRoute('/owner/videos')({
  head: () => ({
    meta: [
      { title: 'Venue Video Management — Playo Owner' },
      { name: 'description', content: 'Upload promotional video tours, drone footage, and match highlights for your venues.' },
    ],
  }),
  component: OwnerVideosPage,
});

const SAMPLE_DEMO_VIDEOS = [
  {
    title: 'Floodlit Match Highlights & Night Play',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    duration: 35,
  },
  {
    title: '360° Turf & Changing Room Virtual Tour',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    duration: 48,
  },
  {
    title: 'European Synthetic Grass Inspection & Pitch Bounce',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    duration: 60,
  },
];

function OwnerVideosPage() {
  const user = useAuthStore((s) => s.user);
  const ownerId = user?.id ?? 'owner-1';
  const turfs = useOwnerStore((s) => s.turfs);
  const updateTurf = useOwnerStore((s) => s.updateTurf);

  const myVenues = useMemo(() => turfs.filter((t) => t.ownerId === ownerId), [turfs, ownerId]);
  const [selectedVenueId, setSelectedVenueId] = useState<string>(myVenues[0]?.id ?? '');

  const activeVenue = useMemo(
    () => myVenues.find((v) => v.id === selectedVenueId) ?? myVenues[0],
    [myVenues, selectedVenueId]
  );

  const [previewVideoUrl, setPreviewVideoUrl] = useState<string | null>(null);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);

  // Form states
  const [videoTitle, setVideoTitle] = useState('');
  const [videoUrl, setVideoUrl] = useState(SAMPLE_DEMO_VIDEOS[0]!.url);
  const [uploadNotice, setUploadNotice] = useState<string | null>(null);

  const venueVideos = activeVenue?.videos ?? [];

  const handleAddVideo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeVenue) return;

    const newVideo = {
      id: `vid-${Date.now()}`,
      title: videoTitle.trim() || 'Venue Walkthrough Tour',
      url: videoUrl,
      durationSeconds: 45,
      uploadedAt: new Date().toISOString(),
    };

    const updatedVideos = [...(activeVenue.videos ?? []), newVideo];
    updateTurf(activeVenue.id, { videos: updatedVideos });

    setUploadModalOpen(false);
    setVideoTitle('');
    setUploadNotice('Video successfully linked to venue gallery! (Demo storage preview)');
    setTimeout(() => setUploadNotice(null), 4000);
  };

  const handleDeleteVideo = (videoId: string) => {
    if (!activeVenue) return;
    const filtered = (activeVenue.videos ?? []).filter((v) => v.id !== videoId);
    updateTurf(activeVenue.id, { videos: filtered });
  };

  return (
    <div className="container-page py-8 space-y-8 animate-in fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-black uppercase text-primary tracking-wider">
            Media & Visual Showcase
          </span>
          <h1 className="font-display text-2xl sm:text-3xl font-black text-foreground">
            Venue Video Showcase & Tours
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Engage players with drone sweeps, evening floodlight showcases, and 360° facility tours.
          </p>
        </div>

        <Button
          tone="primary"
          onClick={() => setUploadModalOpen(true)}
          disabled={!activeVenue}
          className="rounded-xl px-5 py-2.5 font-bold shrink-0 shadow-xs"
        >
          <Upload className="size-4 mr-2" /> Upload Venue Video
        </Button>
      </div>

      {uploadNotice && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-3.5 text-xs font-bold text-emerald-600 dark:text-emerald-300">
          <CheckCircle2 className="size-4 shrink-0 text-emerald-500" />
          {uploadNotice}
        </div>
      )}

      {/* Venue Selector */}
      {myVenues.length > 1 && (
        <div className="card-shell p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Building2 className="size-4 text-primary" />
            <span className="text-xs font-bold text-foreground">Select Facility:</span>
          </div>
          <select
            value={selectedVenueId}
            onChange={(e) => setSelectedVenueId(e.target.value)}
            aria-label="Select Facility"
            className="rounded-xl border border-border bg-background px-3 py-2 text-xs sm:text-sm font-bold text-foreground focus:border-primary focus:outline-hidden"
          >
            {myVenues.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name} ({v.city})
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Videos Grid */}
      <div className="space-y-4">
        <SectionHeading
          title={activeVenue ? `${activeVenue.name} — Video Gallery` : 'Video Gallery'}
          subtitle={`${venueVideos.length} published video${venueVideos.length === 1 ? '' : 's'}`}
        />

        {venueVideos.length === 0 ? (
          <div className="card-shell p-12 text-center space-y-3">
            <Film className="size-12 text-muted-foreground mx-auto" />
            <h3 className="font-display text-lg font-black text-foreground">No Videos Uploaded Yet</h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              Facilities with video tours get up to 45% more booking conversions. Upload a video walkthrough of your pitch or gaming zones.
            </p>
            <Button tone="primary" onClick={() => setUploadModalOpen(true)}>
              <Upload className="size-4 mr-2" /> Upload First Video
            </Button>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {venueVideos.map((vid) => (
              <div
                key={vid.id}
                className="group flex flex-col rounded-2xl border border-border/80 bg-card overflow-hidden shadow-xs hover:border-primary/50 transition"
              >
                <div className="relative aspect-16/9 bg-black overflow-hidden flex items-center justify-center">
                  <video
                    src={vid.url}
                    className="size-full object-cover opacity-80"
                    muted
                    playsInline
                  />
                  <button
                    onClick={() => setPreviewVideoUrl(vid.url)}
                    className="absolute size-12 rounded-full bg-primary/90 text-primary-foreground flex items-center justify-center shadow-lg transition-transform hover:scale-110"
                    aria-label="Play video"
                  >
                    <Play className="size-5 fill-current ml-0.5" />
                  </button>
                  <span className="absolute bottom-2 right-2 rounded-md bg-black/70 px-2 py-0.5 text-[10px] font-bold text-white">
                    {vid.durationSeconds ? `${vid.durationSeconds}s` : 'Video'}
                  </span>
                </div>

                <div className="p-4 flex flex-1 flex-col justify-between gap-3">
                  <div>
                    <h4 className="font-bold text-sm text-foreground line-clamp-1">{vid.title}</h4>
                    <span className="text-[11px] text-muted-foreground">
                      Added {new Date(vid.uploadedAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-border/50">
                    <button
                      onClick={() => setPreviewVideoUrl(vid.url)}
                      className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
                    >
                      <Play className="size-3" /> Watch Preview
                    </button>
                    <button
                      onClick={() => handleDeleteVideo(vid.id)}
                      className="text-xs font-bold text-destructive hover:underline flex items-center gap-1"
                    >
                      <Trash2 className="size-3" /> Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Upload Video Modal */}
      {uploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div>
                <h3 className="font-display text-xl font-black text-foreground">
                  Upload Venue Video Tour
                </h3>
                <p className="text-xs text-muted-foreground">
                  Simulated local/mock upload for pitching and previewing.
                </p>
              </div>
              <button
                onClick={() => setUploadModalOpen(false)}
                className="text-muted-foreground hover:text-foreground text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddVideo} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground">Video Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 4K Drone Tour & Evening Floodlight Match"
                  value={videoTitle}
                  onChange={(e) => setVideoTitle(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background px-3.5 py-2 text-sm text-foreground focus:border-primary focus:outline-hidden"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground">Choose Demo Video Clip</label>
                <select
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  aria-label="Choose Demo Video Clip"
                  className="w-full rounded-xl border border-border bg-background px-3.5 py-2 text-xs sm:text-sm text-foreground focus:border-primary focus:outline-hidden"
                >
                  {SAMPLE_DEMO_VIDEOS.map((demo, idx) => (
                    <option key={idx} value={demo.url}>
                      {demo.title} ({demo.duration}s)
                    </option>
                  ))}
                </select>
              </div>

              <div className="rounded-xl border border-dashed border-border p-5 text-center space-y-2 bg-muted/20">
                <Upload className="size-8 text-primary mx-auto" />
                <p className="text-xs font-bold text-foreground">
                  Click to select MP4 / MOV from your device
                </p>
                <p className="text-[11px] text-muted-foreground">
                  Up to 100MB supported · Architecture ready for AWS S3 / Cloudinary
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-border/60">
                <Button variant="outline" type="button" onClick={() => setUploadModalOpen(false)}>
                  Cancel
                </Button>
                <Button tone="primary" type="submit">
                  Publish Video
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Video Player Modal */}
      {previewVideoUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in">
          <div className="w-full max-w-3xl overflow-hidden rounded-2xl bg-black shadow-2xl relative">
            <button
              onClick={() => setPreviewVideoUrl(null)}
              className="absolute top-4 right-4 z-10 size-8 rounded-full bg-black/60 text-white flex items-center justify-center font-bold hover:bg-black"
            >
              ✕
            </button>
            <video
              src={previewVideoUrl}
              controls
              autoPlay
              className="w-full aspect-16/9 object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
}
