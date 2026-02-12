import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import UploadPeserta from "@/components/input-data/UploadPeserta/UploadPeserta";
import ListPeserta from "@/components/input-data/ListPeserta/ListPeserta";
import DiklatDetailForm from "./DiklatDetailForm";
import ListKandidat from "@/components/input-data/ListKandidat";

export default function DiklatCardTabs({
  data,
  onRefresh,
  editProps,
}) {
  return (
    <div
      className="border-t bg-slate-50/50 cursor-default"
      onClick={(e) => e.stopPropagation()}
    >
      <Tabs defaultValue="list_peserta" className="w-full">
        <div className="px-5 pt-4">
          <TabsList className="grid w-full grid-cols-4 max-w-[600px] bg-slate-200/50">
            <TabsTrigger value="list_peserta">
              Data Peserta
            </TabsTrigger>
            <TabsTrigger value="kandidat">Kandidat</TabsTrigger>
            <TabsTrigger value="upload">Upload / Import</TabsTrigger>
            <TabsTrigger value="detail">Detail & Edit</TabsTrigger>
          </TabsList>
        </div>

        <Separator className="mt-4 mb-4" />

        <div className="px-5 pb-6">
          <TabsContent value="list_peserta" className="mt-0 focus-visible:ring-0">
            <ListPeserta diklatId={data.id} />
          </TabsContent>

          <TabsContent value="upload" className="mt-0 focus-visible:ring-0">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <UploadPeserta diklatId={data.id} diklatTitle={data.title} onSuccess={onRefresh} />
            </div>
          </TabsContent>

          <TabsContent value="detail" className="mt-0 focus-visible:ring-0">
            <DiklatDetailForm data={data} {...editProps} />
          </TabsContent>

          <TabsContent value="kandidat" className="mt-0 focus-visible:ring-0">
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                  <ListKandidat diklatId={data.id} diklatTitle={data.title} />
              </div>
          </TabsContent>

        </div>
      </Tabs>
    </div>
  );
}
