'use client';

import React, { useState, useRef } from 'react';
import {
  Row, Col, Card, Table, Typography, Tag, Timeline,
  Collapse, Button, Spin, Divider
} from 'antd';
import {
  DownloadOutlined, StarOutlined, SunOutlined, MoonOutlined,
  CalendarOutlined, ClockCircleOutlined, EnvironmentOutlined,
  FireOutlined, HeartOutlined, CompassOutlined
} from '@ant-design/icons';
import Image from 'next/image';
import BirthDetailsForm from '@/components/BirthDetailsForm';
import KundaliChart from '@/components/KundaliChart';
import { calculateKundali, getCharts, getDasha, getAscendantReport, downloadPdf } from '@/lib/api';
import styles from './page.module.css';

const { Title, Text, Paragraph } = Typography;

/* eslint-disable @typescript-eslint/no-explicit-any */

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [kundaliData, setKundaliData] = useState<any>(null);
  const [chartData, setChartData] = useState<any>(null);
  const [dashaData, setDashaData] = useState<any>(null);
  const [ascendantData, setAscendantData] = useState<any>(null);
  const [formValues, setFormValues] = useState<any>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  const handleSubmit = async (values: {
    name: string;
    dob: string;
    tob: string;
    place: string;
    lat: number;
    lon: number;
    timezone: number;
  }) => {
    setLoading(true);
    setFormValues(values);

    try {
      const [kundali, charts, dasha, ascendant] = await Promise.all([
        calculateKundali(values).catch(err => {
          console.error('Kundali error:', err);
          return null;
        }),
        getCharts(values).catch(err => {
          console.error('Charts error:', err);
          return null;
        }),
        getDasha(values).catch(err => {
          console.error('Dasha error:', err);
          return null;
        }),
        getAscendantReport(values).catch(err => {
          console.error('Ascendant error:', err);
          return null;
        }),
      ]);

      console.log('API Responses:', { kundali, charts, dasha, ascendant });

      if (kundali) setKundaliData(kundali);
      if (charts) setChartData(charts);
      if (dasha) setDashaData(dasha);
      if (ascendant) setAscendantData(ascendant);

      if (kundali || charts) {
        // Scroll to results on success
        setTimeout(() => {
          resultsRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!kundaliData || !formValues) return;

    try {
      const blob = await downloadPdf({
        ...kundaliData,
        name: formValues.name,
        charts: chartData,
        dasha: dashaData,
        ascendant: ascendantData,
      });

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${formValues.name || 'Kundali'}_Report.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('PDF error:', error);
    }
  };

  const hasResults = kundaliData || chartData;

  // Planet columns for table
  const planetColumns = [
    {
      title: 'Planet',
      dataIndex: 'planet',
      key: 'planet',
      render: (name: string, record: any) => (
        <span style={{ color: '#D4AF37', fontWeight: 600 }}>
          {name} {record.is_retrograde && <Tag color="red" style={{ fontSize: '10px' }}>R</Tag>}
        </span>
      ),
    },
    { title: 'Sign', dataIndex: 'sign', key: 'sign' },
    { title: 'Sign Lord', dataIndex: 'sign_lord', key: 'sign_lord' },
    { title: 'Degree', dataIndex: 'degrees', key: 'degree' },
    { title: 'Nakshatra', dataIndex: 'nakshatra', key: 'nakshatra' },
    { title: 'Nakshatra Lord', dataIndex: 'nakshatra_lord', key: 'nakshatra_lord' },
    { title: 'Pada', dataIndex: 'nakshatra_pada', key: 'pada' },
  ];

  return (
    <main className={styles.main}>
      {/* Hero Section */}
      <section className={styles.heroSection}>
        <div className={styles.mandalaWrapper}>
          <Image
            src="/assets/mandala.png"
            alt="Mandala"
            width={400}
            height={400}
            className={styles.mandala}
            priority
          />
        </div>

        <div className={styles.heroContent}>
          <Title level={1} className={`${styles.heroTitle} shimmer-text`}>
            कुंडली.AI
          </Title>
          <Paragraph className={styles.heroSubtitle}>
            Professional Vedic Astrology & Kundali Generation
            <br />
            <Text type="secondary" style={{ fontSize: '0.9rem' }}>
              Powered by authentic Panchang calculations & Swiss Ephemeris
            </Text>
          </Paragraph>

          <div className={styles.formContainer}>
            <BirthDetailsForm onSubmit={handleSubmit} loading={loading} />
          </div>
        </div>
      </section>

      {/* Loading State */}
      {loading && (
        <section className={styles.loadingSection}>
          <Spin size="large" />
          <Text className={styles.loadingText}>Calculating planetary positions...</Text>
        </section>
      )}

      {/* Results Section - Single Page Scrollable */}
      {hasResults && !loading && (
        <div ref={resultsRef} className={styles.resultsContainer}>

          {/* 1. Profile Header */}
          {formValues && (
            <section className={styles.section}>
              <Card className={styles.profileCard}>
                <Row align="middle" justify="space-between">
                  <Col>
                    <Title level={2} className="gold-text" style={{ margin: 0 }}>
                      {formValues.name}
                    </Title>
                    <div style={{ marginTop: 8 }}>
                      <Tag icon={<CalendarOutlined />} color="gold">{formValues.dob}</Tag>
                      <Tag icon={<ClockCircleOutlined />} color="gold">{formValues.tob}</Tag>
                      <Tag icon={<EnvironmentOutlined />} color="gold">{formValues.place}</Tag>
                    </div>
                  </Col>
                  <Col>
                    <Button
                      type="primary"
                      size="large"
                      icon={<DownloadOutlined />}
                      onClick={handleDownloadPdf}
                      className={styles.downloadButton}
                    >
                      Download PDF
                    </Button>
                  </Col>
                </Row>
              </Card>
            </section>
          )}

          {/* 2. Birth Details & Panchang */}
          {kundaliData && (
            <section className={styles.section}>
              <Title level={3} className={styles.sectionTitle}>
                <SunOutlined /> जन्म विवरण / Birth Details & Panchang
              </Title>
              <Row gutter={[24, 24]}>
                {/* Basic Details */}
                <Col xs={24} md={8}>
                  <Card className={styles.infoCard} title={<span className="gold-text">Basic Details</span>}>
                    <div className={styles.infoGrid}>
                      <div className={styles.infoItem}>
                        <span className={styles.infoLabel}>Date of Birth</span>
                        <span className={styles.infoValue}>{kundaliData.basic_details?.date_of_birth}</span>
                      </div>
                      <div className={styles.infoItem}>
                        <span className={styles.infoLabel}>Time of Birth</span>
                        <span className={styles.infoValue}>{kundaliData.basic_details?.time_of_birth}</span>
                      </div>
                      <div className={styles.infoItem}>
                        <span className={styles.infoLabel}>Place</span>
                        <span className={styles.infoValue}>{kundaliData.basic_details?.place_of_birth}</span>
                      </div>
                      <div className={styles.infoItem}>
                        <span className={styles.infoLabel}>Latitude</span>
                        <span className={styles.infoValue}>{kundaliData.basic_details?.latitude}</span>
                      </div>
                      <div className={styles.infoItem}>
                        <span className={styles.infoLabel}>Longitude</span>
                        <span className={styles.infoValue}>{kundaliData.basic_details?.longitude}</span>
                      </div>
                      <div className={styles.infoItem}>
                        <span className={styles.infoLabel}>Sunrise</span>
                        <span className={styles.infoValue}>{kundaliData.basic_details?.sunrise}</span>
                      </div>
                      <div className={styles.infoItem}>
                        <span className={styles.infoLabel}>Sunset</span>
                        <span className={styles.infoValue}>{kundaliData.basic_details?.sunset}</span>
                      </div>
                    </div>
                  </Card>
                </Col>

                {/* Panchang Details */}
                <Col xs={24} md={8}>
                  <Card className={styles.infoCard} title={<span className="gold-text">पंचांग / Panchang</span>}>
                    <div className={styles.infoGrid}>
                      <div className={styles.infoItem}>
                        <span className={styles.infoLabel}>Tithi</span>
                        <span className={styles.infoValue}>{kundaliData.panchang_details?.tithi}</span>
                      </div>
                      <div className={styles.infoItem}>
                        <span className={styles.infoLabel}>Nakshatra</span>
                        <span className={styles.infoValue}>{kundaliData.panchang_details?.nakshatra}</span>
                      </div>
                      <div className={styles.infoItem}>
                        <span className={styles.infoLabel}>Yoga</span>
                        <span className={styles.infoValue}>{kundaliData.panchang_details?.yog}</span>
                      </div>
                      <div className={styles.infoItem}>
                        <span className={styles.infoLabel}>Karana</span>
                        <span className={styles.infoValue}>{kundaliData.panchang_details?.karan}</span>
                      </div>
                      <div className={styles.infoItem}>
                        <span className={styles.infoLabel}>Day Lord</span>
                        <span className={styles.infoValue}>{kundaliData.panchang_details?.day}</span>
                      </div>
                      <div className={styles.infoItem}>
                        <span className={styles.infoLabel}>Moon Sign</span>
                        <span className={styles.infoValue}>{kundaliData.panchang_details?.moon_sign}</span>
                      </div>
                      <div className={styles.infoItem}>
                        <span className={styles.infoLabel}>Month</span>
                        <span className={styles.infoValue}>{kundaliData.panchang_details?.month}</span>
                      </div>
                    </div>
                  </Card>
                </Col>

                {/* Ghat Chakra / Avakhada */}
                <Col xs={24} md={8}>
                  <Card className={styles.infoCard} title={<span className="gold-text">घाट चक्र / Ghat Chakra</span>}>
                    <div className={styles.infoGrid}>
                      <div className={styles.infoItem}>
                        <span className={styles.infoLabel}>Varna</span>
                        <span className={styles.infoValue}>{kundaliData.ghat_chakra?.varna}</span>
                      </div>
                      <div className={styles.infoItem}>
                        <span className={styles.infoLabel}>Vashya</span>
                        <span className={styles.infoValue}>{kundaliData.ghat_chakra?.vashya}</span>
                      </div>
                      <div className={styles.infoItem}>
                        <span className={styles.infoLabel}>Yoni</span>
                        <span className={styles.infoValue}>{kundaliData.ghat_chakra?.yoni}</span>
                      </div>
                      <div className={styles.infoItem}>
                        <span className={styles.infoLabel}>Gan</span>
                        <span className={styles.infoValue}>{kundaliData.ghat_chakra?.gan}</span>
                      </div>
                      <div className={styles.infoItem}>
                        <span className={styles.infoLabel}>Nadi</span>
                        <span className={styles.infoValue}>{kundaliData.ghat_chakra?.nadi}</span>
                      </div>
                    </div>
                  </Card>
                </Col>
              </Row>
            </section>
          )}

          {/* 3. Astrological Details */}
          {kundaliData?.astrological_details && (
            <section className={styles.section}>
              <Title level={3} className={styles.sectionTitle}>
                <CompassOutlined /> ज्योतिष विवरण / Astrological Details
              </Title>
              <Card className={styles.infoCard}>
                <Row gutter={[24, 16]}>
                  <Col xs={12} md={4}>
                    <div className={styles.statBox}>
                      <span className={styles.statLabel}>Moon Sign</span>
                      <span className={styles.statValue}>{kundaliData.astrological_details?.sign}</span>
                    </div>
                  </Col>
                  <Col xs={12} md={4}>
                    <div className={styles.statBox}>
                      <span className={styles.statLabel}>Sign Lord</span>
                      <span className={styles.statValue}>{kundaliData.astrological_details?.sign_lord}</span>
                    </div>
                  </Col>
                  <Col xs={12} md={4}>
                    <div className={styles.statBox}>
                      <span className={styles.statLabel}>Nakshatra</span>
                      <span className={styles.statValue}>{kundaliData.astrological_details?.nakshatra}</span>
                    </div>
                  </Col>
                  <Col xs={12} md={4}>
                    <div className={styles.statBox}>
                      <span className={styles.statLabel}>Nakshatra Lord</span>
                      <span className={styles.statValue}>{kundaliData.astrological_details?.nakshatra_lord}</span>
                    </div>
                  </Col>
                  <Col xs={12} md={4}>
                    <div className={styles.statBox}>
                      <span className={styles.statLabel}>Ascendant</span>
                      <span className={styles.statValue}>{kundaliData.astrological_details?.ascendant}</span>
                    </div>
                  </Col>
                  <Col xs={12} md={4}>
                    <div className={styles.statBox}>
                      <span className={styles.statLabel}>Ascendant Lord</span>
                      <span className={styles.statValue}>{kundaliData.astrological_details?.ascendant_lord}</span>
                    </div>
                  </Col>
                  <Col xs={12} md={4}>
                    <div className={styles.statBox}>
                      <span className={styles.statLabel}>Charan (Pada)</span>
                      <span className={styles.statValue}>{kundaliData.astrological_details?.charan}</span>
                    </div>
                  </Col>
                  <Col xs={12} md={4}>
                    <div className={styles.statBox}>
                      <span className={styles.statLabel}>Tatva</span>
                      <span className={styles.statValue}>{kundaliData.astrological_details?.tatva}</span>
                    </div>
                  </Col>
                  <Col xs={12} md={4}>
                    <div className={styles.statBox}>
                      <span className={styles.statLabel}>Yunja</span>
                      <span className={styles.statValue}>{kundaliData.astrological_details?.yunja}</span>
                    </div>
                  </Col>
                  <Col xs={12} md={4}>
                    <div className={styles.statBox}>
                      <span className={styles.statLabel}>Paya</span>
                      <span className={styles.statValue}>{kundaliData.astrological_details?.paya}</span>
                    </div>
                  </Col>
                  <Col xs={12} md={4}>
                    <div className={styles.statBox}>
                      <span className={styles.statLabel}>Name Alphabet</span>
                      <span className={styles.statValue}>{kundaliData.astrological_details?.name_alphabet}</span>
                    </div>
                  </Col>
                  <Col xs={12} md={4}>
                    <div className={styles.statBox}>
                      <span className={styles.statLabel}>Dasha Balance</span>
                      <span className={styles.statValue}>{kundaliData.dasha_balance}</span>
                    </div>
                  </Col>
                </Row>
              </Card>
            </section>
          )}

          {/* 4. Kundali Charts */}
          {chartData && (chartData.lagna_chart || chartData.moon_chart || chartData.navamsha_chart) && (
            <section className={styles.section}>
              <Title level={3} className={styles.sectionTitle}>
                <StarOutlined /> कुंडली चार्ट / Kundali Charts
              </Title>
              <Row gutter={[24, 24]}>
                {chartData.lagna_chart && (
                  <Col xs={24} lg={8}>
                    <KundaliChart
                      title="लग्न कुंडली (Lagna)"
                      houses={chartData.lagna_chart.houses}
                      ascendantSign={chartData.lagna_chart.planets?.[0]?.sign || 'Pisces'}
                    />
                  </Col>
                )}
                {chartData.moon_chart && (
                  <Col xs={24} lg={8}>
                    <KundaliChart
                      title="चन्द्र कुंडली (Moon)"
                      houses={chartData.moon_chart.houses}
                      ascendantSign={chartData.moon_chart.planets?.[2]?.sign || 'Leo'}
                    />
                  </Col>
                )}
                {chartData.navamsha_chart && (
                  <Col xs={24} lg={8}>
                    <KundaliChart
                      title="नवांश (D9)"
                      houses={chartData.navamsha_chart.houses}
                      ascendantSign={chartData.navamsha_chart.planets?.[0]?.d9_sign || 'Virgo'}
                    />
                  </Col>
                )}
              </Row>
            </section>
          )}

          {/* 5. Planetary Positions */}
          {kundaliData?.planets && (
            <section className={styles.section}>
              <Title level={3} className={styles.sectionTitle}>
                <SunOutlined /> ग्रह स्थिति / Planetary Positions
              </Title>
              <Card className={styles.tableCard}>
                <Table
                  dataSource={kundaliData.planets}
                  columns={planetColumns}
                  pagination={false}
                  rowKey="planet"
                  size="middle"
                  scroll={{ x: 800 }}
                />
              </Card>
            </section>
          )}

          {/* 6. Vimshottari Dasha */}
          {dashaData && (
            <section className={styles.section}>
              <Title level={3} className={styles.sectionTitle}>
                <FireOutlined /> विंशोत्तरी दशा / Vimshottari Dasha
              </Title>
              <Card className={styles.infoCard}>
                {/* Current Dasha */}
                {dashaData.current_dasha && (
                  <div className={styles.currentDasha}>
                    <Title level={4} style={{ color: '#D4AF37', marginBottom: 16 }}>
                      वर्तमान दशा / Current Running Dasha
                    </Title>
                    <Row gutter={[16, 16]}>
                      <Col xs={24} md={8}>
                        <div className={styles.dashaBox}>
                          <span className={styles.dashaLabel}>Mahadasha</span>
                          <span className={styles.dashaValue}>{dashaData.current_dasha.mahadasha?.lord}</span>
                          <span className={styles.dashaDate}>
                            {dashaData.current_dasha.mahadasha?.start_date} - {dashaData.current_dasha.mahadasha?.end_date}
                          </span>
                        </div>
                      </Col>
                      <Col xs={24} md={8}>
                        <div className={styles.dashaBox}>
                          <span className={styles.dashaLabel}>Antardasha</span>
                          <span className={styles.dashaValue}>{dashaData.current_dasha.antardasha?.lord}</span>
                          <span className={styles.dashaDate}>
                            {dashaData.current_dasha.antardasha?.start_date} - {dashaData.current_dasha.antardasha?.end_date}
                          </span>
                        </div>
                      </Col>
                      <Col xs={24} md={8}>
                        <div className={styles.dashaBox}>
                          <span className={styles.dashaLabel}>Pratyantardasha</span>
                          <span className={styles.dashaValue}>{dashaData.current_dasha.pratyantardasha?.lord}</span>
                          <span className={styles.dashaDate}>
                            {dashaData.current_dasha.pratyantardasha?.start_date} - {dashaData.current_dasha.pratyantardasha?.end_date}
                          </span>
                        </div>
                      </Col>
                    </Row>
                  </div>
                )}

                <Divider />

                {/* Mahadasha Timeline */}
                {dashaData.mahadashas && (
                  <>
                    <Title level={5} style={{ color: '#E8E6E3', marginBottom: 16 }}>
                      महादशा क्रम / Mahadasha Sequence
                    </Title>
                    <Collapse
                      ghost
                      className={styles.dashaCollapse}
                      items={dashaData.mahadashas.map((md: any, idx: number) => ({
                        key: idx,
                        label: (
                          <div className={styles.dashaHeader}>
                            <span style={{ color: md.is_current ? '#D4AF37' : '#E8E6E3', fontWeight: 600, fontSize: '1rem' }}>
                              {md.lord} Mahadasha
                            </span>
                            <Text type="secondary" style={{ marginLeft: 12 }}>
                              {md.start_date} — {md.end_date}
                            </Text>
                            {md.is_current && <Tag color="gold" style={{ marginLeft: 8 }}>Current</Tag>}
                          </div>
                        ),
                        children: md.antardashas && (
                          <div className={styles.antardashaGrid}>
                            {md.antardashas.map((ad: any, adIdx: number) => (
                              <div
                                key={adIdx}
                                className={`${styles.antardashaItem} ${ad.is_current ? styles.currentAntardasha : ''}`}
                              >
                                <div className={styles.antardashaLord}>{ad.lord}</div>
                                <div className={styles.antardashaDates}>
                                  {ad.start_date} — {ad.end_date}
                                </div>
                                {ad.is_current && <Tag color="gold">Current</Tag>}
                              </div>
                            ))}
                          </div>
                        ),
                      }))}
                    />
                  </>
                )}
              </Card>
            </section>
          )}

          {/* 7. Ascendant Report */}
          {ascendantData?.report && (
            <section className={styles.section}>
              <Title level={3} className={styles.sectionTitle}>
                <HeartOutlined /> लग्न विश्लेषण / Ascendant Report
              </Title>
              <Card className={styles.ascendantCard}>
                <Row gutter={[32, 24]}>
                  <Col xs={24} md={8}>
                    <div className={styles.ascendantHeader}>
                      <Title level={2} className="gold-text" style={{ marginBottom: 0 }}>
                        {ascendantData.report.sign}
                      </Title>
                      <Text type="secondary">{ascendantData.report.sign} Rising ({ascendantData.report.symbol})</Text>
                      <Divider style={{ margin: '16px 0' }} />
                      <div className={styles.ascendantDetails}>
                        <div><strong>Lord:</strong> {ascendantData.report.lord}</div>
                        <div><strong>Symbol:</strong> {ascendantData.report.symbol}</div>
                        <div><strong>Lucky Gem:</strong> {ascendantData.report.lucky_gems}</div>
                        <div><strong>Characteristics:</strong> {ascendantData.report.characteristics}</div>
                        <div><strong>Fast Day:</strong> {ascendantData.report.day_of_fast}</div>
                      </div>
                    </div>
                  </Col>
                  <Col xs={24} md={16}>
                    <Paragraph style={{ fontSize: '1rem', lineHeight: 1.8 }}>
                      {ascendantData.report.description}
                    </Paragraph>

                    <Row gutter={24} style={{ marginTop: 24 }}>
                      <Col xs={24} md={12}>
                        <Title level={5} style={{ color: '#52c41a' }}>Positive Traits</Title>
                        <div className={styles.traitsGrid}>
                          {ascendantData.report.positive_traits?.map((trait: string, i: number) => (
                            <Tag key={i} color="green">{trait}</Tag>
                          ))}
                        </div>
                      </Col>
                      <Col xs={24} md={12}>
                        <Title level={5} style={{ color: '#ff4d4f' }}>Negative Traits</Title>
                        <div className={styles.traitsGrid}>
                          {ascendantData.report.negative_traits?.map((trait: string, i: number) => (
                            <Tag key={i} color="red">{trait}</Tag>
                          ))}
                        </div>
                      </Col>
                    </Row>

                    {ascendantData.report.spiritual_lesson && (
                      <>
                        <Divider />
                        <Title level={5} className="gold-text">Spiritual Lesson</Title>
                        <Paragraph>{ascendantData.report.spiritual_lesson}</Paragraph>
                      </>
                    )}
                  </Col>
                </Row>
              </Card>
            </section>
          )}

          {/* Download Footer */}
          <section className={styles.downloadFooter}>
            <Button
              type="primary"
              size="large"
              icon={<DownloadOutlined />}
              onClick={handleDownloadPdf}
              className={styles.downloadButton}
            >
              Download Complete PDF Report
            </Button>
          </section>
        </div>
      )}

      {/* Footer */}
      <footer className={styles.footer}>
        <Text type="secondary">
          © 2024 Kundali.AI • Powered by Vedic Astrology & Swiss Ephemeris
        </Text>
      </footer>
    </main>
  );
}
