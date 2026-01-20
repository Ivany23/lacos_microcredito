import { FileText, Download, Eye } from "lucide-react";

export default function Documents({ data }: { data: any }) {
    const documentos = data.documentos || [];

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6 bg-white p-4 rounded-3xl border border-[#E5E5EA]">
                <div className="w-10 h-10 bg-[#5856D6]/10 rounded-xl flex items-center justify-center text-[#5856D6]">
                    <FileText className="w-5 h-5" />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-[#1C1C1E]">Documentos</h2>
                    <p className="text-sm text-[#8E8E93]">{documentos.length} arquivos anexados</p>
                </div>
            </div>

            {documentos.length > 0 ? (
                <div className="grid grid-cols-1 gap-3">
                    {documentos.map((doc: any, idx: number) => (
                        <div key={idx} className="bg-white p-4 rounded-2xl border border-[#E5E5EA] flex items-center justify-between hover:bg-[#F2F2F7] transition-colors group">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-[#F2F2F7] rounded-xl flex items-center justify-center group-hover:bg-white group-hover:shadow-sm transition-all">
                                    <FileText className="w-6 h-6 text-[#8E8E93] group-hover:text-[#5856D6]" />
                                </div>
                                <div>
                                    <p className="font-bold text-[#1C1C1E] text-lg">{doc.tipoDocumento}</p>
                                    <p className="text-sm font-mono font-medium text-[#8E8E93]">{doc.numeroDocumento}</p>
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <button className="p-2 text-[#8E8E93] hover:text-[#007AFF] hover:bg-[#007AFF]/10 rounded-lg transition-colors" title="Visualizar">
                                    <Eye className="w-5 h-5" />
                                </button>
                                {}
                                <button className="p-2 text-[#8E8E93] hover:text-[#34C759] hover:bg-[#34C759]/10 rounded-lg transition-colors" title="Baixar">
                                    <Download className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-12 bg-[#F2F2F7] rounded-3xl border border-dashed border-[#AEAEB2]">
                    <FileText className="w-12 h-12 text-[#AEAEB2] mx-auto mb-3 opacity-50" />
                    <p className="font-bold text-[#8E8E93]">Nenhum documento encontrado.</p>
                </div>
            )}
        </div>
    );
}
