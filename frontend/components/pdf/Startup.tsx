import React from 'react';
import { Page, Text, View, Document, StyleSheet, Image } from '@react-pdf/renderer';
import { ProjectDetailsProps } from '@/types/project';
import { getBackendUrl } from '@/lib/config';

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 30, // Réduit de 40 à 30
    fontFamily: 'Helvetica'
  },
  
  // Header Section
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20, // Réduit de 30 à 20
    paddingBottom: 15, // Réduit de 20 à 15
    borderBottom: '3px solid #3b82f6'
  },
  title: {
    fontSize: 24, // Réduit de 28 à 24
    fontWeight: 'bold',
    color: '#1e293b',
    textTransform: 'uppercase',
    letterSpacing: 1
  },
  subtitle: {
    fontSize: 12, // Réduit de 14 à 12
    color: '#64748b',
    marginTop: 3 // Réduit de 5 à 3
  },
  
  // Status Badge
  statusBadge: {
    backgroundColor: '#10b981',
    color: '#ffffff',
    padding: 6, // Réduit de 8 à 6
    borderRadius: 20,
    fontSize: 10, // Réduit de 12 à 10
    fontWeight: 'bold',
    textAlign: 'center',
    minWidth: 70 // Réduit de 80 à 70
  },
  
  // Main Content Grid
  contentGrid: {
    flexDirection: 'row',
    gap: 20, // Réduit de 30 à 20
    marginBottom: 20 // Réduit de 30 à 20
  },
  leftColumn: {
    flex: 2,
    gap: 15 // Réduit de 25 à 15
  },
  rightColumn: {
    flex: 1,
    gap: 15 // Réduit de 20 à 15
  },
  
  // Section Styles
  section: {
    marginBottom: 15 // Réduit de 25 à 15
  },
  sectionTitle: {
    fontSize: 14, // Réduit de 16 à 14
    fontWeight: 'bold',
    color: '#1e40af',
    marginBottom: 8, // Réduit de 10 à 8
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    borderBottom: '1px solid #e2e8f0',
    paddingBottom: 3 // Réduit de 5 à 3
  },
  
  // Card Styles
  card: {
    backgroundColor: '#f8fafc',
    padding: 15, // Réduit de 20 à 15
    borderRadius: 8,
    border: '1px solid #e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4
  },
  
  // Text Styles
  description: {
    fontSize: 11,
    lineHeight: 1.6,
    color: '#374151',
    textAlign: 'justify'
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 8,
    alignItems: 'center'
  },
  infoLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#6b7280',
    minWidth: 80,
    textTransform: 'uppercase'
  },
  infoValue: {
    fontSize: 10,
    color: '#111827',
    flex: 1
  },
  
  // Founders Section
  foundersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10 // Réduit de 15 à 10
  },
  founderCard: {
    backgroundColor: '#ffffff',
    padding: 10, // Réduit de 15 à 10
    borderRadius: 8,
    border: '1px solid #d1d5db',
    minWidth: 120, // Réduit de 140 à 120
    alignItems: 'center'
  },
  founderAvatar: {
    width: 40, // Réduit de 50 à 40
    height: 40, // Réduit de 50 à 40
    borderRadius: 25,
    marginBottom: 8,
    backgroundColor: '#3b82f6'
  },
  founderName: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#1f2937',
    textAlign: 'center'
  },
  founderId: {
    fontSize: 9,
    color: '#6b7280',
    textAlign: 'center'
  },
  
  // Tags and Badges
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 5
  },
  tag: {
    backgroundColor: '#eff6ff',
    color: '#1d4ed8',
    padding: 6,
    borderRadius: 6,
    fontSize: 9,
    fontWeight: 'bold',
    border: '1px solid #bfdbfe'
  },
  
  // Contact Section
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6, // Réduit de 10 à 6
    backgroundColor: '#f9fafb',
    padding: 8, // Réduit de 10 à 8
    borderRadius: 6
  },
  contactIcon: {
    width: 16,
    height: 16,
    marginRight: 10,
    backgroundColor: '#3b82f6',
    borderRadius: 8
  },
  contactText: {
    fontSize: 10,
    color: '#374151'
  },
  
  // Footer
  footer: {
    marginTop: 15, // Réduit de 30 à 15
    paddingTop: 10, // Réduit de 20 à 10
    borderTop: '2px solid #e5e7eb',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  footerText: {
    fontSize: 9,
    color: '#9ca3af'
  },
  
  // Highlight Box
  highlightBox: {
    backgroundColor: '#fef3c7',
    border: '2px solid #f59e0b',
    borderRadius: 8,
    padding: 10, // Réduit de 15 à 10
    marginBottom: 15 // Réduit de 20 à 15
  },
  highlightText: {
    fontSize: 12,
    color: '#92400e',
    fontWeight: 'bold',
    textAlign: 'center'
  }
});

export default function StartupPDF({ projects }: { projects: ProjectDetailsProps[] }) {
    const formatDate = (dateString: string) => {
      return new Date(dateString).toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    };
    const backUrl = getBackendUrl();
    

    return (
        <Document>
            {projects.map((project, index) => (
                <Page key={project.ProjectId || index} size="A4" style={styles.page}>
                    {/* Header */}
                    <View style={styles.header}>
                        <View>
                            <Text style={styles.title}>{project.ProjectName}</Text>
                            <Text style={styles.subtitle}>Startup Pitch Deck</Text>
                        </View>
                        <View style={styles.statusBadge}>
                            <Text>{project.ProjectStatus}</Text>
                        </View>
                    </View>

                    {/* Highlight Box */}
                    <View style={styles.highlightBox}>
                        <Text style={styles.highlightText}>
                            {project.ProjectSector} • {project.ProjectMaturity} • {project.ProjectAddress}
                        </Text>
                    </View>

                    {/* Main Content Grid */}
                    <View style={styles.contentGrid}>
                        {/* Left Column */}
                        <View style={styles.leftColumn}>
                            {/* Description Section */}
                            <View style={styles.section}>
                                <Text style={styles.sectionTitle}>Description du Projet</Text>
                                <View style={styles.card}>
                                    <Text style={styles.description}>{project.ProjectDescription}</Text>
                                </View>
                            </View>

                            {/* Project Details */}
                            <View style={styles.section}>
                                <Text style={styles.sectionTitle}>Informations Détaillées</Text>
                                <View style={styles.card}>
                                    <View style={styles.infoRow}>
                                        <Text style={styles.infoLabel}>Secteur:</Text>
                                        <Text style={styles.infoValue}>{project.ProjectSector}</Text>
                                    </View>
                                    <View style={styles.infoRow}>
                                        <Text style={styles.infoLabel}>Maturité:</Text>
                                        <Text style={styles.infoValue}>{project.ProjectMaturity}</Text>
                                    </View>
                                    <View style={styles.infoRow}>
                                        <Text style={styles.infoLabel}>Statut Légal:</Text>
                                        <Text style={styles.infoValue}>{project.ProjectLegalStatus}</Text>
                                    </View>
                                    <View style={styles.infoRow}>
                                        <Text style={styles.infoLabel}>Créé le:</Text>
                                        <Text style={styles.infoValue}>{formatDate(project.ProjectCreatedAt)}</Text>
                                    </View>
                                    <View style={styles.infoRow}>
                                        <Text style={styles.infoLabel}>Besoins:</Text>
                                        <Text style={styles.infoValue}>{project.ProjectNeeds}</Text>
                                    </View>
                                </View>
                            </View>

                            {/* Founders Section */}
                            <View style={styles.section}>
                                <Text style={styles.sectionTitle}>Équipe Fondatrice</Text>
                                <View style={styles.foundersGrid}>
                                    {project.ProjectFounders.map((founder, founderIndex) => (
                                        <View key={founder.FounderID || founderIndex} style={styles.founderCard}>
                                            {founder.FounderPictureURL ? (
                                                <Image source={backUrl + founder.FounderPictureURL} style={styles.founderAvatar} />
                                            ) : (
                                                <View style={styles.founderAvatar} />
                                            )}
                                            <Text style={styles.founderName}>{founder.FounderName}</Text>
                                        </View>
                                    ))}
                                </View>
                            </View>
                        </View>

                        {/* Right Column */}
                        <View style={styles.rightColumn}>
                            {/* Contact Information */}
                            <View style={styles.section}>
                                <Text style={styles.sectionTitle}>Contact</Text>
                                <View style={styles.card}>
                                    <View style={styles.contactRow}>
                                        <View style={styles.contactIcon} />
                                        <Text style={styles.contactText}>{project.ProjectEmail}</Text>
                                    </View>
                                    <View style={styles.contactRow}>
                                        <View style={styles.contactIcon} />
                                        <Text style={styles.contactText}>{project.ProjectPhone}</Text>
                                    </View>
                                    <View style={styles.contactRow}>
                                        <View style={styles.contactIcon} />
                                        <Text style={styles.contactText}>{project.ProjectWebsite}</Text>
                                    </View>
                                    <View style={styles.contactRow}>
                                        <View style={styles.contactIcon} />
                                        <Text style={styles.contactText}>{project.ProjectSocial}</Text>
                                    </View>
                                </View>
                            </View>

                            {/* Location */}
                            <View style={styles.section}>
                                <Text style={styles.sectionTitle}>Localisation</Text>
                                <View style={styles.card}>
                                    <Text style={styles.description}>{project.ProjectAddress}</Text>
                                </View>
                            </View>

                            {/* Tags */}
                            <View style={styles.section}>
                                <Text style={styles.sectionTitle}>Tags</Text>
                                <View style={styles.tagContainer}>
                                    <View style={styles.tag}>
                                        <Text>{project.ProjectSector}</Text>
                                    </View>
                                    <View style={styles.tag}>
                                        <Text>{project.ProjectMaturity}</Text>
                                    </View>
                                    <View style={styles.tag}>
                                        <Text>{project.ProjectStatus}</Text>
                                    </View>
                                </View>
                            </View>
                        </View>
                    </View>

                    {/* Footer */}
                    <View style={styles.footer}>
                        <Text style={styles.footerText}>
                            Document généré le {new Date().toLocaleDateString('fr-FR')}
                        </Text>
                        <Text style={styles.footerText}>
                            ID Projet: {project.ProjectId}
                        </Text>
                    </View>
                </Page>
            ))}
        </Document>
    );
}