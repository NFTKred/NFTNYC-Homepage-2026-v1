import PageMeta from '@/components/PageMeta';

export default function Journey() {
  return (
    <>
      <PageMeta page="journey" />
      <iframe
        src="/journey/index.html"
        title="Journey to NFT.NYC 2026"
        style={{
          position: 'fixed',
          inset: 0,
          width: '100%',
          height: '100%',
          border: 'none',
        }}
      />
    </>
  );
}
