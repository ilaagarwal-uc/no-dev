import React, { useMemo } from 'react';
import {
  generateBillOfMaterials,
  groupBOMByCategory,
  formatCurrency,
  formatDimensions,
  formatCoverageArea,
} from '../../../data-service/application/create-look/bom_generator';
import {
  IAppliedModel,
  ICatalogItem,
  CatalogCategory,
} from '../../../data-service/domain/create-look/create_look_schema';
import styles from './bom_modal.module.css';

export interface IBOMModalProps {
  isOpen: boolean;
  appliedModels: IAppliedModel[];
  catalogItems: ICatalogItem[];
  onClose: () => void;
  onExportPDF: () => void;
  onExportCSV: () => void;
}

/**
 * Category display names
 */
const CATEGORY_NAMES: Record<CatalogCategory, string> = {
  panels: 'Panels',
  lights: 'Lights',
  cove: 'Cove',
  bidding: 'Bidding',
  artwork: 'Artwork',
  other: 'Other',
};

export function BOMModal({
  isOpen,
  appliedModels,
  catalogItems,
  onClose,
  onExportPDF,
  onExportCSV,
}: IBOMModalProps) {
  // Generate BOM
  const bom = useMemo(
    () => generateBillOfMaterials(appliedModels, catalogItems),
    [appliedModels, catalogItems]
  );

  // Group by category
  const groupedBOM = useMemo(() => groupBOMByCategory(bom.items), [bom.items]);

  if (!isOpen) {
    return null;
  }

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div
        className={styles.modalContent}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-labelledby="bom-modal-title"
        aria-modal="true"
      >
        <div className={styles.modalHeader}>
          <h2 id="bom-modal-title">Bill of Materials</h2>
          <button
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Close Bill of Materials modal"
          >
            ×
          </button>
        </div>

        <div className={styles.modalBody}>
          {bom.items.length === 0 ? (
            <div className={styles.emptyState}>
              <p>No items in Bill of Materials</p>
              <p className={styles.emptyStateHint}>
                Add models to your look to generate a BOM
              </p>
            </div>
          ) : (
            <>
              {/* BOM Table organized by category */}
              <div className={styles.bomTable}>
                {Array.from(groupedBOM.entries()).map(([category, items]) => (
                  <div key={category} className={styles.categorySection}>
                    <h3 className={styles.categoryHeader}>
                      {CATEGORY_NAMES[category]}
                    </h3>
                    <table className={styles.table}>
                      <thead>
                        <tr>
                          <th>Item Name</th>
                          <th>Dimensions</th>
                          <th>Quantity</th>
                          <th>Unit Cost</th>
                          <th>Total Cost</th>
                          <th>Coverage</th>
                        </tr>
                      </thead>
                      <tbody>
                        {items.map((item) => (
                          <tr key={item.catalogItemId}>
                            <td className={styles.itemName}>
                              {item.name}
                              {item.instances > 1 && (
                                <span className={styles.instanceBadge}>
                                  {item.instances}× applied
                                </span>
                              )}
                            </td>
                            <td className={styles.dimensions}>
                              {formatDimensions(item.dimensions)}
                            </td>
                            <td className={styles.quantity}>{item.quantity}</td>
                            <td className={styles.cost}>
                              {formatCurrency(item.unitCost)}
                            </td>
                            <td className={styles.cost}>
                              {formatCurrency(item.totalCost)}
                            </td>
                            <td className={styles.coverage}>
                              {formatCoverageArea(item.coverageArea)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ))}
              </div>

              {/* Grand Totals */}
              <div className={styles.grandTotals}>
                <h3>Grand Totals</h3>
                <div className={styles.totalsGrid}>
                  <div className={styles.totalItem}>
                    <span className={styles.totalLabel}>Total Items:</span>
                    <span className={styles.totalValue}>
                      {bom.grandTotal.totalItems}
                    </span>
                  </div>
                  <div className={styles.totalItem}>
                    <span className={styles.totalLabel}>Total Quantity:</span>
                    <span className={styles.totalValue}>
                      {bom.grandTotal.totalQuantity}
                    </span>
                  </div>
                  <div className={styles.totalItem}>
                    <span className={styles.totalLabel}>Total Cost:</span>
                    <span className={styles.totalValue}>
                      {formatCurrency(bom.grandTotal.totalCost)}
                    </span>
                  </div>
                  <div className={styles.totalItem}>
                    <span className={styles.totalLabel}>Total Coverage:</span>
                    <span className={styles.totalValue}>
                      {formatCoverageArea(bom.grandTotal.totalCoverageArea)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Generated timestamp */}
              <div className={styles.timestamp}>
                Generated: {new Date(bom.generatedAt).toLocaleString()}
              </div>
            </>
          )}
        </div>

        {/* Export buttons */}
        <div className={styles.modalFooter}>
          <button
            className={styles.exportButton}
            onClick={handlePrint}
            aria-label="Print Bill of Materials"
            disabled={bom.items.length === 0}
          >
            <span className={styles.buttonIcon}>🖨️</span>
            Print
          </button>
          <button
            className={styles.exportButton}
            onClick={onExportPDF}
            aria-label="Export Bill of Materials to PDF"
            disabled={bom.items.length === 0}
          >
            <span className={styles.buttonIcon}>📄</span>
            Export PDF
          </button>
          <button
            className={styles.exportButton}
            onClick={onExportCSV}
            aria-label="Export Bill of Materials to CSV"
            disabled={bom.items.length === 0}
          >
            <span className={styles.buttonIcon}>📊</span>
            Export CSV
          </button>
        </div>
      </div>
    </div>
  );
}
