"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useWizard } from '../../context/WizardContext';
import { useI18n } from '../../../context/I18nContext';
import { DeleteApiCacheButton } from '../../components/DeleteApiCacheButton';
import StepNavigation from '../../../components/StepNavigation';
import CytoscapeComponent from 'react-cytoscapejs';
import {
  getAllEnvironmentalNodes,
  EnvironmentalNode,
  MOCK_PROJECTS,
  MOCK_INNOVATIONS,
  MOCK_PROCESSES,
  MOCK_SIMILAR_DEMANDS
} from '../../../lib/mockData/environmentalAnalysis';

export default function StepPage() {
  const router = useRouter();
  const wizard = useWizard();
  const { t } = useI18n();
  const [isLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [threshold, setThreshold] = useState(50);
  const [selectedNode, setSelectedNode] = useState<EnvironmentalNode | null>(null);
  const [cyInstance, setCyInstance] = useState<any>(null);
  const currentStep = 4;

  useEffect(() => {
    setMounted(true);
    wizard.setStep(currentStep);
  }, [currentStep, wizard]);

  // Re-run layout when threshold changes
  useEffect(() => {
    if (cyInstance) {
      const layout = cyInstance.layout({
        name: 'cose',
        animate: true,
        animationDuration: 500,
        nodeRepulsion: 8000,
        idealEdgeLength: 100,
        edgeElasticity: 100,
        randomize: false
      });
      layout.run();
    }
  }, [threshold, cyInstance]);

  const handleNext = () => {
    router.push('/step/5');
  };

  // Get color for node type
  const getNodeColor = (type: string) => {
    switch (type) {
      case 'current': return '#2563EB'; // Blue - Your Demand
      case 'demand': return '#DC2626'; // Red - Similar Demand (Duplicate risk)
      case 'project': return '#7C3AED'; // Purple - Running Project
      case 'innovation': return '#F59E0B'; // Amber - Innovation Idea
      case 'process': return '#10B981'; // Green - Business Process
      default: return '#9CA3AF'; // Gray
    }
  };

  // Get node label based on type
  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'demand': return t.step4.typeSimilarDemand;
      case 'project': return t.step4.typeRunningProject;
      case 'innovation': return t.step4.typeInnovationIdea;
      case 'process': return t.step4.typeBusinessProcess;
      default: return '';
    }
  };

  const renderStepContent = () => {
    if (!mounted) {
      return <div className="text-center p-10">{t.step4.loading}</div>;
    }

    const { nodes, filteredCount, totalCount } = getAllEnvironmentalNodes(wizard.text, threshold);

    // Create graph elements for Cytoscape
    const graphElements = [
      // Central node (current demand)
      {
        data: {
          id: 'current-demand',
          label: t.step4.yourIdea,
          type: 'current',
          similarity: 100
        }
      },
      // Add all filtered nodes
      ...nodes.map(node => ({
        data: {
          id: node.id,
          label: `${node.title}\n(${node.similarity}%)`,
          type: node.type,
          similarity: node.similarity,
          fullData: node
        }
      })),
      // Add edges from current demand to all nodes
      ...nodes.map(node => ({
        data: {
          source: 'current-demand',
          target: node.id,
          similarity: node.similarity
        }
      }))
    ];

    // Cytoscape stylesheet with modern look
    const graphStylesheet = [
      {
        selector: 'node',
        style: {
          'label': 'data(label)',
          'text-valign': 'center',
          'text-halign': 'center',
          'color': '#FFFFFF',
          'font-size': '10px',
          'font-weight': 'bold',
          'text-wrap': 'wrap',
          'text-max-width': '80px',
          'width': '70px',
          'height': '70px',
          'border-width': 3,
          'text-outline-color': (ele: any) => getNodeColor(ele.data('type')),
          'text-outline-width': 2
        }
      },
      {
        selector: 'node[type="current"]',
        style: {
          'background-color': '#2563EB',
          'border-color': '#1D4ED8',
          'width': '100px',
          'height': '100px',
          'font-size': '12px',
          'z-index': 10
        }
      },
      {
        selector: 'node[type="demand"]',
        style: {
          'background-color': '#DC2626',
          'border-color': '#991B1B'
        }
      },
      {
        selector: 'node[type="project"]',
        style: {
          'background-color': '#7C3AED',
          'border-color': '#5B21B6'
        }
      },
      {
        selector: 'node[type="innovation"]',
        style: {
          'background-color': '#F59E0B',
          'border-color': '#D97706'
        }
      },
      {
        selector: 'node[type="process"]',
        style: {
          'background-color': '#10B981',
          'border-color': '#059669'
        }
      },
      {
        selector: 'edge',
        style: {
          'width': (ele: any) => Math.max(2, (ele.data('similarity') / 100) * 5),
          'line-color': (ele: any) => {
            const similarity = ele.data('similarity');
            if (similarity >= 80) return '#DC2626'; // High similarity - Red
            if (similarity >= 60) return '#F59E0B'; // Medium - Amber
            return '#9CA3AF'; // Low - Gray
          },
          'opacity': (ele: any) => 0.3 + (ele.data('similarity') / 100) * 0.7,
          'curve-style': 'bezier'
        }
      },
      {
        selector: 'node:selected',
        style: {
          'border-width': 5,
          'border-color': '#FBBF24'
        }
      }
    ];

    return (
      <div className='h-full flex flex-col gap-4'>
        {/* Header with threshold slider */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">{t.step4.subtitle}</h3>
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
              {t.step4.similarityThreshold}: {threshold}%
            </label>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={threshold}
              onChange={(e) => setThreshold(Number(e.target.value))}
              className="flex-grow h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <span className="text-sm text-gray-600 whitespace-nowrap">
              {t.step4.showingNodes
                .replace('{count}', filteredCount.toString())
                .replace('{total}', totalCount.toString())}
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-2">{t.step4.adjustThreshold}</p>
        </div>

        {/* Graph Visualization */}
        <div className="flex-grow border-2 border-gray-200 rounded-lg bg-white shadow-lg relative overflow-hidden">
          <CytoscapeComponent
            elements={graphElements}
            stylesheet={graphStylesheet as any}
            layout={{
              name: 'cose',
              animate: true,
              animationDuration: 500,
              nodeRepulsion: 8000,
              idealEdgeLength: 100,
              edgeElasticity: 100
            }}
            className="w-full h-full"
            cy={(cy: any) => {
              setCyInstance(cy);
              cy.on('tap', 'node', (evt: any) => {
                const node = evt.target;
                const data = node.data('fullData');
                if (data) {
                  setSelectedNode(data);
                }
              });
              cy.on('tap', (evt: any) => {
                if (evt.target === cy) {
                  setSelectedNode(null);
                }
              });
            }}
          />

          {/* Legend overlay */}
          <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm p-4 rounded-lg shadow-lg border border-gray-200 max-w-xs">
            <h4 className="font-semibold text-sm mb-2 text-gray-800">{t.step4.legend}</h4>
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-blue-600 border-2 border-blue-800"></div>
                <span>{t.step4.yourIdea}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-red-600 border-2 border-red-800"></div>
                <span>{t.step4.typeSimilarDemand}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-purple-600 border-2 border-purple-800"></div>
                <span>{t.step4.typeRunningProject}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-amber-500 border-2 border-amber-700"></div>
                <span>{t.step4.typeInnovationIdea}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-green-500 border-2 border-green-700"></div>
                <span>{t.step4.typeBusinessProcess}</span>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-3 italic">{t.step4.clickNodeInfo}</p>
          </div>
        </div>
      </div>
    );
  };

  const renderCopilotContent = () => {
    if (!mounted) return <div className="text-center p-10">{t.step4.loading}</div>;

    return (
      <>
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">{t.step4.title}</h2>

        {/* Selected Node Details */}
        {selectedNode ? (
          <div className="p-4 border-l-4 rounded-r-lg bg-white border border-gray-200 shadow-sm"
            style={{ borderLeftColor: getNodeColor(selectedNode.type) }}>
            <div className="flex items-center gap-2 mb-3">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: getNodeColor(selectedNode.type) }}
              ></div>
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                {getTypeLabel(selectedNode.type)}
              </span>
            </div>

            <h4 className="font-bold text-lg text-gray-900 mb-2">{selectedNode.title}</h4>
            <p className="text-sm text-gray-700 mb-3">{selectedNode.description}</p>

            {selectedNode.similarity !== undefined && (
              <div className="mb-3">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-medium text-gray-600">{t.step4.similarity}</span>
                  <span className="text-sm font-bold" style={{ color: getNodeColor(selectedNode.type) }}>
                    {selectedNode.similarity}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${selectedNode.similarity}%`,
                      backgroundColor: getNodeColor(selectedNode.type)
                    }}
                  ></div>
                </div>
              </div>
            )}

            {selectedNode.reason && (
              <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                <h5 className="text-xs font-semibold text-gray-700 mb-1">{t.step4.reason}:</h5>
                <p className="text-xs text-gray-600 leading-relaxed">{selectedNode.reason}</p>
              </div>
            )}
          </div>
        ) : (
          <div className="p-6 bg-blue-50 border-l-4 border-blue-500 rounded-r-lg">
            <p className="text-sm text-blue-700">{t.step4.noSelection}</p>
          </div>
        )}

        {/* Summary Statistics */}
        <div className="mt-6 grid grid-cols-2 gap-3">
          <div className="bg-red-50 p-3 rounded-lg border border-red-200">
            <div className="text-2xl font-bold text-red-600">{MOCK_SIMILAR_DEMANDS.filter(d => (d.similarity || 0) >= threshold).length}</div>
            <div className="text-xs text-red-700">{t.step4.typeSimilarDemand}</div>
          </div>
          <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
            <div className="text-2xl font-bold text-purple-600">{MOCK_PROJECTS.filter(p => (p.similarity || 0) >= threshold).length}</div>
            <div className="text-xs text-purple-700">{t.step4.typeRunningProject}</div>
          </div>
          <div className="bg-amber-50 p-3 rounded-lg border border-amber-200">
            <div className="text-2xl font-bold text-amber-600">{MOCK_INNOVATIONS.filter(i => (i.similarity || 0) >= threshold).length}</div>
            <div className="text-xs text-amber-700">{t.step4.typeInnovationIdea}</div>
          </div>
          <div className="bg-green-50 p-3 rounded-lg border border-green-200">
            <div className="text-2xl font-bold text-green-600">{MOCK_PROCESSES.filter(p => (p.similarity || 0) >= threshold).length}</div>
            <div className="text-xs text-green-700">{t.step4.typeBusinessProcess}</div>
          </div>
        </div>
      </>
    );
  };

  return (
    <div className="flex flex-col min-h-screen lg:h-full">
      <div className="grid grid-cols-1 lg:grid-cols-3 lg:flex-grow lg:overflow-hidden">
        <div className="lg:col-span-2 p-4 md:p-8 lg:overflow-y-auto">
            {renderStepContent()}
        </div>
        {/* Mobile: Show copilot content below main content */}
        <div className="block lg:hidden p-4 md:p-8 bg-gray-50 border-t border-gray-200">
            {renderCopilotContent()}
        </div>
        {/* Desktop: Show copilot content in sidebar */}
        <aside className="hidden lg:block lg:col-span-1 p-4 md:p-8 bg-gray-50 border-l border-gray-200 lg:overflow-y-auto">
            {renderCopilotContent()}
        </aside>
        <div className="lg:col-span-3">
          <StepNavigation
            currentStep={currentStep}
            totalSteps={7}
            onNext={handleNext}
            onBack={() => router.back()}
            isNextDisabled={false}
            isLoading={isLoading}
            developerTools={
              <>
                <button
                  onClick={() => { wizard.reset(); router.push('/step/1'); }}
                  className="px-6 py-2.5 bg-red-500 text-white rounded-lg font-semibold text-sm"
                >
                  {t.common.deleteSessionData}
                </button>
                <DeleteApiCacheButton />
              </>
            }
            t={t}
          />
        </div>
      </div>
    </div>
  );
}
