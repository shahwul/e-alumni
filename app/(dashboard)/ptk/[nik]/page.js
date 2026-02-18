import DetailPTK from "@/components/ptk/detailPTK/DetailPTK";

export default async function DetailPTKPage({ params }) {
  const { nik } = await params;
  return <DetailPTK nik={nik} />;
}
