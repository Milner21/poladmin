// src/pages/private/reportes-imprimir/styles/pdfStyles.ts

import { StyleSheet } from "@react-pdf/renderer";

export const pdfStyles = StyleSheet.create({
  page: {
    fontSize: 10,
    padding: 30,
    backgroundColor: "#ffffff",
  },
  pagePortrait: {
    fontSize: 10,
    padding: 40,
    backgroundColor: "#ffffff",
  },
  header: {
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  logoText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1e293b",
  },
  subtitle: {
    fontSize: 12,
    color: "#64748b",
    marginLeft: 5,
  },
  reportTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#1e293b",
    marginTop: 10,
  },
  infoRow: {
    flexDirection: "row",
    marginTop: 3,
  },
  infoLabel: {
    fontSize: 9,
    color: "#64748b",
    width: 80,
  },
  infoValue: {
    fontSize: 9,
    color: "#1e293b",
    flex: 1,
  },
  // Estilos de la tabla
  table: {
    marginTop: 20,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f8fafc",
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderBottomWidth: 1.5,
    borderBottomColor: "#cbd5e1",
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 6,
    paddingHorizontal: 4,
    borderBottomWidth: 0.5,
    borderBottomColor: "#e2e8f0",
    minHeight: 20,
  },
  tableRowOdd: {
    backgroundColor: "#fafafa",
  },
  cellHeader: {
    fontSize: 7,
    fontWeight: "bold",
    color: "#374151",
    flex: 1,
    textAlign: "left",
    paddingRight: 3,
  },
  cellHeaderWithBorder: {
    fontSize: 7,
    fontWeight: "bold",
    color: "#374151",
    flex: 1,
    textAlign: "left",
    paddingRight: 3,
    borderRightWidth: 0.5,
    borderRightColor: "#cbd5e1",
  },
  cell: {
    fontSize: 7,
    color: "#1e293b",
    flex: 1,
    textAlign: "left",
    paddingRight: 3,
    paddingVertical: 1,
  },
  cellWithBorder: {
    fontSize: 7,
    color: "#1e293b",
    flex: 1,
    textAlign: "left",
    paddingRight: 3,
    paddingVertical: 1,
    borderRightWidth: 0.25,
    borderRightColor: "#e2e8f0",
  },
  // Estilos de paginas de estadisticas
  statsPage: {
    fontSize: 10,
    padding: 40,
    backgroundColor: "#ffffff",
  },
  statsTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1e293b",
    marginBottom: 20,
    textAlign: "center",
  },
  statsSection: {
    marginBottom: 25,
  },
  statsSectionTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#374151",
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    paddingBottom: 5,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: "#f1f5f9",
  },
  statsRowOdd: {
    backgroundColor: "#f8fafc",
  },
  statsLabel: {
    fontSize: 9,
    color: "#374151",
  },
  statsValue: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#1e293b",
  },
  // Agrupadores
  groupHeader: {
    backgroundColor: "#e2e8f0",
    paddingVertical: 8,
    paddingHorizontal: 6,
    marginTop: 5,
  },
  groupTitle: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#1e293b",
  },
  groupSubtitle: {
    fontSize: 8,
    color: "#64748b",
    marginTop: 2,
  },
  // Footer
  footer: {
    position: "absolute",
    bottom: 30,
    left: 30,
    right: 30,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
  },
  footerPortrait: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
  },
  footerText: {
    fontSize: 8,
    color: "#64748b",
  },
  totalRow: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
  },
  totalText: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#1e293b",
    textAlign: "right",
  },
});