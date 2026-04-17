import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { 
  FileText, 
  Upload, 
  Loader2, 
  AlertCircle, 
  Trash2, 
  Layers,
  Fingerprint,
  Zap,
  ArrowRight,
  Sparkles,
  RefreshCcw,
  CheckCircle2,
  Box
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import axios from "axios";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type DispatchStatus = 'idle' | 'processing' | 'success' | 'error';

export default function App() {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<DispatchStatus>('idle');
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
      setError(null);
      setStatus('idle');
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'text/plain': ['.txt'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
    maxFiles: 1,
    multiple: false,
  } as any);

  const clearFile = () => {
    setFile(null);
    setStatus('idle');
    setError(null);
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64String = (reader.result as string).split(',')[1];
        resolve(base64String);
      };
      reader.onerror = error => reject(error);
    });
  };

  const handleDispatch = async () => {
    if (!file) return;

    setStatus('processing');
    setError(null);

    try {
      const base64Data = await fileToBase64(file);
      
      await axios.post("/api/dispatch", {
        base64Data,
        mimeType: file.type || "application/pdf",
        fileName: file.name,
        fileSize: file.size
      });

      setStatus('success');
    } catch (err: any) {
      console.error("Dispatch Error:", err);
      setError(err.response?.data?.error || "Failed to forward document. Please check server logs.");
      setStatus('error');
    }
  };

  return (
    <div className="min-h-screen bg-bg text-text-main flex flex-col p-4 md:p-12">
      
      {/* Navigation */}
      <nav className="max-w-4xl w-full mx-auto flex justify-between items-center mb-16">
        <div className="flex items-center gap-4 group">
          <div className="w-12 h-12 bg-brand rounded-2xl flex items-center justify-center shadow-lg shadow-brand/20 group-hover:scale-110 transition-transform">
            <Layers className="text-white" size={24} />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight leading-none text-slate-900 uppercase">Everything Document</h1>
            <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-slate-400 mt-1">Integration Gateway</p>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-6">
          <Fingerprint size={20} className="text-slate-300" />
        </div>
      </nav>

      <main className="max-w-4xl w-full mx-auto flex-1 flex flex-col items-center">
        
        {/* Simplified Site Heading */}
        <div className="text-center mb-12 max-w-2xl px-4">
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight mb-4">
            Automated Document Integration.
          </h2>
          <p className="text-slate-500 font-medium leading-relaxed">
            Securely upload and dispatch your documents directly into your automated processing workflows with zero friction.
          </p>
        </div>

        <div className="w-full space-y-8">
          
          {/* Main Workzone */}
          <section className="panel-white overflow-hidden relative w-full">
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <Box size={120} />
            </div>

            <header className="mb-8 relative z-10 flex justify-between items-center">
              <div>
                <span className="label-caps">Process</span>
                <h2 className="text-2xl font-bold tracking-tight">Document Processing</h2>
              </div>
              {status === 'success' && (
                <button 
                  onClick={clearFile}
                  className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-brand transition-colors"
                >
                  <RefreshCcw size={14} />
                  New Upload
                </button>
              )}
            </header>

            <div className="space-y-8 relative z-10">
              <AnimatePresence mode="wait">
                {status !== 'success' && !file ? (
                  <motion.div 
                    key="uploader"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                  >
                    <div 
                      {...getRootProps()} 
                      className={cn(
                        "border-2 border-dashed rounded-[2.5rem] h-80 flex flex-col items-center justify-center text-center cursor-pointer transition-all",
                        isDragActive ? "border-brand bg-brand-soft" : "border-slate-200 hover:border-brand/40 group bg-slate-50/50"
                      )}
                    >
                      <input {...getInputProps()} />
                      <div className="w-20 h-20 bg-white rounded-3xl shadow-sm border border-slate-100 flex items-center justify-center mb-4 group-hover:-translate-y-2 transition-transform">
                        <Upload size={32} className="text-brand" />
                      </div>
                      <p className="font-bold text-slate-600 uppercase tracking-widest">Select Document</p>
                      <p className="text-xs text-slate-400 mt-1 font-bold italic">Ready for secure processing</p>
                    </div>
                  </motion.div>
                ) : status !== 'success' ? (
                  <motion.div 
                    key="file-ready"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="space-y-8"
                  >
                    <div className="p-8 rounded-[2.5rem] bg-slate-50 border border-slate-200 flex items-center justify-between shadow-sm">
                      <div className="flex items-center gap-6">
                        <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center text-brand">
                          <FileText size={32} />
                        </div>
                        <div>
                          <p className="text-lg font-bold text-slate-800 break-all">{file?.name}</p>
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                            {file ? (file.size / 1024 / 1024).toFixed(2) : 0} MB • READY
                          </p>
                        </div>
                      </div>
                      <button 
                        onClick={clearFile}
                        className="w-12 h-12 rounded-2xl hover:bg-red-50 hover:text-red-500 transition-colors flex items-center justify-center text-slate-300"
                      >
                        <Trash2 size={24} />
                      </button>
                    </div>

                    <button
                      disabled={status === 'processing'}
                      onClick={handleDispatch}
                      className="modern-btn w-full flex items-center justify-center gap-3 h-20 text-lg shadow-2xl shadow-brand/20 group"
                    >
                      {status === 'processing' ? (
                        <>
                          <Loader2 className="animate-spin" size={24} />
                          <span>PROCESSING...</span>
                        </>
                      ) : (
                        <>
                          <Zap size={22} className="group-hover:animate-pulse" />
                          <span>UPLOAD AND PROCESS</span>
                          <ArrowRight size={20} className="opacity-40" />
                        </>
                      )}
                    </button>
                  </motion.div>
                ) : (
                  <motion.div 
                    key="success"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-12 text-center space-y-6"
                  >
                    <div className="inline-flex w-24 h-24 bg-emerald-50 text-emerald-500 rounded-full items-center justify-center mb-4">
                      <CheckCircle2 size={48} />
                    </div>
                    <div>
                      <h3 className="text-3xl font-black text-slate-900 tracking-tight">Process Successful</h3>
                      <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px] mt-2 italic">Document dispatched for processing</p>
                    </div>
                    <div className="pt-4 flex flex-col items-center gap-2">
                       <p className="text-sm font-medium text-slate-500 max-w-xs transition-colors">
                        Your document has been securely received and forwarded to your automation gateway.
                       </p>
                       <button 
                         onClick={clearFile}
                         className="mt-6 px-8 py-4 bg-slate-900 text-white rounded-2xl font-bold uppercase tracking-widest text-xs hover:bg-brand transition-all flex items-center gap-3"
                       >
                         <RefreshCcw size={16} />
                         New Dispatch
                       </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {error && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-6 bg-rose-50 border border-rose-100 rounded-[2rem] flex items-start gap-4"
                >
                  <AlertCircle className="text-rose-500 mt-1 shrink-0" size={20} />
                  <div>
                    <h4 className="text-sm font-bold text-rose-800 uppercase tracking-wide">Gateway Error</h4>
                    <p className="text-xs text-rose-600 mt-1 leading-relaxed font-medium">{error}</p>
                  </div>
                </motion.div>
              )}
            </div>
          </section>

          {/* Tips Section */}
          {status !== 'success' && status !== 'processing' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { title: "Direct", icon: Box, text: "Bypasses intermediary processing for speed." },
                { title: "Encrypted", icon: Fingerprint, text: "Secure headers with signature validation." },
                { title: "Automated", icon: Sparkles, text: "Perfect for n8n and Zapier pipelines." }
              ].map((tip, i) => (
                <div key={i} className="p-6 rounded-3xl bg-white/50 border border-slate-100 flex flex-col items-center text-center">
                  <div className="w-10 h-10 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center mb-3 text-brand text-opacity-80">
                    <tip.icon size={18} />
                  </div>
                  <h4 className="text-xs font-black uppercase tracking-widest text-slate-800 mb-1">{tip.title}</h4>
                  <p className="text-[10px] text-slate-400 font-medium leading-relaxed">{tip.text}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-4xl w-full mx-auto mt-12 py-8 border-t border-slate-100 flex justify-between items-center text-[10px] font-bold text-slate-300 uppercase tracking-[0.2em] select-none">
        <div className="flex items-center gap-6">
          <span>&copy; 2026 Everything Document</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-1.5 bg-brand rounded-full shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
          <span>v3.0.0 N8N-ONLY</span>
        </div>
      </footer>
    </div>
  );
}
