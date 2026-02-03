'use client';

import React from 'react';
import { Form, Input, DatePicker, TimePicker, Button, Row, Col } from 'antd';
import { UserOutlined, EnvironmentOutlined, LoadingOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';
import styles from './BirthDetailsForm.module.css';

interface FormValues {
    name: string;
    dob: Dayjs;
    tob: Dayjs;
    place: string;
    lat: number;
    lon: number;
}

interface BirthDetailsFormProps {
    onSubmit: (values: {
        name: string;
        dob: string;
        tob: string;
        place: string;
        lat: number;
        lon: number;
        timezone: number;
    }) => void;
    loading?: boolean;
}

export default function BirthDetailsForm({ onSubmit, loading }: BirthDetailsFormProps) {
    const [form] = Form.useForm();

    const handleFinish = (values: FormValues) => {
        onSubmit({
            name: values.name,
            dob: values.dob.format('DD/MM/YYYY'),
            tob: values.tob.format('HH:mm'),
            place: values.place,
            lat: values.lat,
            lon: values.lon,
            timezone: 5.5, // Default IST
        });
    };

    // Pre-fill with sample data for testing
    const fillSampleData = () => {
        form.setFieldsValue({
            name: 'Sample User',
            dob: dayjs('1990-01-15'),
            tob: dayjs('10:30', 'HH:mm'),
            place: 'New Delhi, India',
            lat: 28.6139,
            lon: 77.2090,
        });
    };

    return (
        <div className={styles.formWrapper}>
            <Form
                form={form}
                layout="vertical"
                onFinish={handleFinish}
                className={styles.form}
                requiredMark={false}
                initialValues={{
                    lat: 28.6139,
                    lon: 77.2090,
                    place: 'New Delhi, India',
                }}
            >
                <Form.Item
                    name="name"
                    label={<span className={styles.label}>नाम / Name</span>}
                    rules={[{ required: true, message: 'Please enter name' }]}
                >
                    <Input
                        prefix={<UserOutlined style={{ color: 'rgba(212, 175, 55, 0.5)' }} />}
                        placeholder="Enter your name"
                        size="large"
                        className={styles.input}
                    />
                </Form.Item>

                <Row gutter={16}>
                    <Col xs={24} sm={12}>
                        <Form.Item
                            name="dob"
                            label={<span className={styles.label}>जन्म तिथि / Date of Birth</span>}
                            rules={[{ required: true, message: 'Please select date' }]}
                        >
                            <DatePicker
                                size="large"
                                style={{ width: '100%' }}
                                format="DD/MM/YYYY"
                                placeholder="Select date"
                                className={styles.input}
                            />
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                        <Form.Item
                            name="tob"
                            label={<span className={styles.label}>जन्म समय / Time of Birth</span>}
                            rules={[{ required: true, message: 'Please select time' }]}
                        >
                            <TimePicker
                                size="large"
                                style={{ width: '100%' }}
                                format="HH:mm"
                                placeholder="Select time"
                                className={styles.input}
                            />
                        </Form.Item>
                    </Col>
                </Row>

                <Form.Item
                    name="place"
                    label={<span className={styles.label}>जन्म स्थान / Birth Place</span>}
                    rules={[{ required: true, message: 'Please enter birth place' }]}
                >
                    <Input
                        prefix={<EnvironmentOutlined style={{ color: 'rgba(212, 175, 55, 0.5)' }} />}
                        placeholder="City, Country"
                        size="large"
                        className={styles.input}
                    />
                </Form.Item>

                <Row gutter={16}>
                    <Col xs={24} sm={12}>
                        <Form.Item
                            name="lat"
                            label={<span className={styles.label}>अक्षांश / Latitude</span>}
                            rules={[{ required: true, message: 'Required' }]}
                        >
                            <Input
                                type="number"
                                step="0.0001"
                                size="large"
                                placeholder="e.g., 28.6139"
                                className={styles.input}
                            />
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                        <Form.Item
                            name="lon"
                            label={<span className={styles.label}>देशान्तर / Longitude</span>}
                            rules={[{ required: true, message: 'Required' }]}
                        >
                            <Input
                                type="number"
                                step="0.0001"
                                size="large"
                                placeholder="e.g., 77.2090"
                                className={styles.input}
                            />
                        </Form.Item>
                    </Col>
                </Row>

                <Form.Item className={styles.submitWrapper}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%' }}>
                        <Button
                            type="primary"
                            htmlType="submit"
                            size="large"
                            block
                            loading={loading}
                            icon={loading ? <LoadingOutlined /> : undefined}
                            className={styles.submitButton}
                        >
                            {loading ? 'Generating Kundali...' : 'कुंडली बनाएं / Generate Kundali'}
                        </Button>
                        <Button
                            type="link"
                            onClick={fillSampleData}
                            className={styles.sampleLink}
                        >
                            Use sample data (Delhi)
                        </Button>
                    </div>
                </Form.Item>
            </Form>
        </div>
    );
}
