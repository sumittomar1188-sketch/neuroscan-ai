import React from 'react';
import {
  BrainCircuit,
  Layers,
  Cpu,
  Eye,
  ShieldAlert,
  ArrowRight,
  Code2,
  Activity,
  CheckCircle2,
  Sparkles,
  Flame,
  FileCheck
} from 'lucide-react';
import PageHeader from '../components/common/PageHeader';
import DisclaimerBanner from '../components/common/Disclaimer';

export const AboutModel = () => {
  const categories = [
    {
      name: 'Glioma',
      tag: 'Primary Brain Tumor',
      color: 'border-amber-200 bg-amber-50/70 text-amber-900',
      badge: 'bg-amber-100 text-amber-800',
      description: 'Tumors that originate in the glial cells supporting brain tissue. Often characterized by irregular infiltrative borders on T2-weighted MRI scans.'
    },
    {
      name: 'Meningioma',
      tag: 'Meningeal Layer Tumor',
      color: 'border-purple-200 bg-purple-50/70 text-purple-900',
      badge: 'bg-purple-100 text-purple-800',
      description: 'Arises from the meninges—the membranes surrounding the brain and spinal cord. Typically well-circumscribed extra-axial lesions on MRI.'
    },
    {
      name: 'No Tumor',
      tag: 'Normal Brain Scan',
      color: 'border-emerald-200 bg-emerald-50/70 text-emerald-900',
      badge: 'bg-emerald-100 text-emerald-800',
      description: 'Normal brain tissue without identifiable neoplastic mass lesions, abnormal focal contrast enhancement, or mass effect.'
    },
    {
      name: 'Pituitary',
      tag: 'Sellar Region Adenoma',
      color: 'border-teal-200 bg-teal-50/70 text-teal-900',
      badge: 'bg-teal-100 text-teal-800',
      description: 'Tumors originating in the pituitary gland at the base of the skull, often evaluated using coronal T1 contrast-enhanced MRI.'
    }
  ];

  const workflowSteps = [
    {
      step: '01',
      title: 'MRI Image Upload',
      description: 'User submits JPG or PNG brain scan via web client to FastAPI backend endpoints.',
      icon: FileCheck,
    },
    {
      step: '02',
      title: 'Brain MRI Validation',
      description: 'Multi-signal OOD filter checks spectral monochromatic profile, background air margins, and semantic screening to reject unrelated photos (cats, phones, landscapes).',
      icon: ShieldAlert,
    },
    {
      step: '03',
      title: 'Image Preprocessing',
      description: 'Image tensors are scaled to 224×224 pixels and normalized for ResNet50 deep feature extraction.',
      icon: Cpu,
    },
    {
      step: '04',
      title: 'ResNet50 Classifier',
      description: 'Deep Residual Network extracts deep cranial features and residual skip-connection embeddings.',
      icon: BrainCircuit,
    },
    {
      step: '05',
      title: 'Classification Output',
      description: 'Softmax layer computes multi-class probability scores across Glioma, Meningioma, No Tumor, and Pituitary.',
      icon: Layers,
    },
    {
      step: '06',
      title: 'Grad-CAM Heatmap',
      description: 'Gradient-weighted Class Activation Mapping projects spatial visual heatmaps onto the original MRI.',
      icon: Flame,
    }
  ];

  const techStack = [
    { name: 'Python 3.10+', category: 'Backend Language' },
    { name: 'TensorFlow / Keras', category: 'Deep Learning Framework' },
    { name: 'ResNet50 Architecture', category: 'Tumor Classification CNN' },
    { name: 'ImageNet MobileNetV2', category: 'OOD Semantic Screening' },
    { name: 'Grad-CAM', category: 'Explainable AI Heatmaps' },
    { name: 'FastAPI', category: 'REST API Framework' },
    { name: 'React 19', category: 'UI Framework' },
    { name: 'Vite', category: 'Build System' },
    { name: 'Tailwind CSS v4', category: 'Styling Engine' },
  ];

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <PageHeader
        title="About NeuroScan AI & Model Architecture"
        description="Technical overview of the ResNet50 deep learning model, 4 classification categories, and end-to-end pipeline."
      />

      {/* Model Overview Hero */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl border border-blue-100">
            <BrainCircuit className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              ResNet50 Convolutional Neural Network
            </h2>
            <p className="text-xs text-slate-500 font-mono">Deep Residual Transfer Learning Model</p>
          </div>
        </div>

        <p className="text-sm text-slate-600 leading-relaxed">
          <strong>NeuroScan AI</strong> employs a customized <strong>ResNet50</strong> architecture pre-trained on ImageNet and fine-tuned on specialized brain MRI dataset benchmarks. ResNet50 uses 50 deep layers with shortcut skip connections to overcome vanishing gradients, allowing the network to capture complex structural patterns, tissue boundaries, and focal signals essential for brain MRI classification.
        </p>
      </div>

      {/* Four Classification Categories */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">
            Classification Target Categories
          </h2>
          <span className="text-xs font-mono text-slate-400">4 Distinct Classes</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {categories.map((cat) => (
            <div
              key={cat.name}
              className={`rounded-2xl p-5 border shadow-xs space-y-3 ${cat.color}`}
            >
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-base tracking-tight">{cat.name}</h3>
                <span className={`px-2.5 py-0.5 text-[11px] font-bold rounded-md uppercase tracking-wider ${cat.badge}`}>
                  {cat.tag}
                </span>
              </div>
              <p className="text-xs leading-relaxed text-slate-700">
                {cat.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Workflow Diagram */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
        <div>
          <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">
            End-to-End Processing Workflow
          </h2>
          <p className="text-xs text-slate-500">
            Five-stage pipeline from client upload to explainable Grad-CAM heatmap visualization
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-4 relative">
          {workflowSteps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={step.step}
                className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 flex flex-col justify-between space-y-3 relative group hover:border-blue-300 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                    Step {step.step}
                  </span>
                  <Icon className="w-5 h-5 text-slate-400 group-hover:text-blue-600 transition-colors" />
                </div>

                <div>
                  <h4 className="font-bold text-slate-900 text-sm mb-1">{step.title}</h4>
                  <p className="text-[11px] text-slate-500 leading-normal">{step.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Technologies Grid */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <Code2 className="w-5 h-5 text-blue-600" />
          <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">
            Technology Stack & Frameworks
          </h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {techStack.map((tech) => (
            <div
              key={tech.name}
              className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl space-y-0.5"
            >
              <div className="font-bold text-slate-900 text-xs truncate">{tech.name}</div>
              <div className="text-[10px] text-slate-400 font-mono truncate">{tech.category}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Regulatory Disclaimer Callout */}
      <DisclaimerBanner />
    </div>
  );
};

export default AboutModel;
