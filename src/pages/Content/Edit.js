import {Row, Col, Card, Button, Input, Form, Skeleton, Divider, Space } from "antd";
import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import useRequest from "../../hooks/useRequest";
import { ShowToast, Severty } from "../../helper/toast";
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { useNavigate } from "react-router";
import apiPath from "../../constants/apiPath";
import DescriptionEditor from '../../components/DescriptionEditor'
import { shortLang, longLang } from "../../config/language";

function Edit() {

    const sectionName   =   "Content";
    const routeName     =   "content";
    const api = {
        addEdit  : apiPath.addEditContent,
    }

    const [form]                = Form.useForm();
    const { request }           = useRequest()
    const params                = useParams();
    const [loading, setLoading] = useState(false)
    const [formValue, setFormValue] = useState();
    const navigate              = useNavigate();
    
    const [editorValue, setEditorValue] =   useState('');
    const [editorEsValue, setEditorEsValue] =   useState('');
    const [editorDeValue, setEditorDeValue] =   useState('');
    const [editorFrValue, setEditorFrValue] =   useState('');

    const handleEditorChange = (data) =>{
        setEditorValue(data);
    }

    const handleEditorEsChange = (data) =>{
        setEditorEsValue(data);
    }

    const handleEditorFrChange = (data) =>{
        setEditorFrValue(data);
    }

    const handleEditorDeChange = (data) =>{
        setEditorDeValue(data);
    }

    const fetchData = (slug) => {
        request({
            url: apiPath.viewContent + "/" + slug,
            method: 'GET',
            onSuccess: (data) => {
                form.setFieldsValue(data.data);
                setFormValue(data.data);
                setLoading(false);

                if (data && data.data && data.data.slug !== 'faq') {
                    setEditorValue(data.data.description);
                    setEditorEsValue(data.data.es_description);
                    setEditorDeValue(data.data.de_description);
                    setEditorFrValue(data.data.fr_description);
                }
                
            },
            onError: (error) => {
                ShowToast(error, Severty.ERROR)
            }
        })
    }

    const OnUpdate = (values) => {

        const { name, ar_name, de_name, fr_name, faq, de_faq, es_faq, fr_faq } = values
        const payload           =   {};

        if(formValue.slug != 'faq'){
            
            if (editorValue.trim() === '<p></p>'   || editorValue.trim() === "") return ShowToast('Please Enter Description in English', Severty.ERROR)
            if (editorEsValue.trim() === '<p></p>' || editorEsValue.trim() === "") return ShowToast('Please Enter Description in Spanish', Severty.ERROR)
            if (editorFrValue.trim() === '<p></p>' || editorFrValue.trim() === "") return ShowToast('Please Enter Description in French', Severty.ERROR)
            if (editorDeValue.trim() === '<p></p>' || editorDeValue.trim() === "") return ShowToast('Please Enter Description in German', Severty.ERROR)

            payload.name            =   name;
            payload.ar_name         =   ar_name;
            payload.de_name         =   de_name;
            payload.fr_name         =   fr_name;
            payload.description     =   editorValue;
            payload.de_description  =   editorDeValue;
            payload.es_description  =   editorEsValue;
            payload.fr_description  =   editorFrValue;

        }else{

            payload.faq             =   faq;
            payload.de_faq          =   de_faq;
            payload.es_faq          =   es_faq;
            payload.fr_faq          =   fr_faq;
        }


        setLoading(true)
        request({
            url: api.addEdit + "/" + params.slug,
            method: 'POST',
            data: payload,
            onSuccess: (data) => {
                setLoading(false)
                if (data.status) {
                    ShowToast(data.message, Severty.SUCCESS)
                    navigate(`/${routeName}`);
                } else {
                    ShowToast(data.message, Severty.ERROR)
                }
            },
            onError: (error) => {
                ShowToast(error.response.data.message, Severty.ERROR)
                setLoading(false)
            },
        })
    };
    
    useEffect(() => {
      setLoading(true)
      fetchData(params.slug)
    }, [])

    return (
        
        <Card title={"Update " + sectionName}>
            {loading ? [1,2,3,4].map(item => <Skeleton active key={item} />) :
                <Form className="edit-page-wrap colPadding" form={form} onFinish={OnUpdate} autoComplete="off" layout="verticle" name="content_form">
                    
                    {
                        formValue && formValue.slug && formValue.slug === 'faq' ?
                        <Row gutter={[24, 0]}>

                            {/* Start English Content */}

                            <Divider orientation="left" orientationMargin={15} className="devider-color">{longLang.en}</Divider>

                            <Col md={24}>
                                <Form.List name="faq" className="mt-2">
                                    {(fields, { add, remove }, { form }) => (
                                        <>
                                            {fields.map((field_en, index_en) => (
                                                <div key={field_en.key}>
                                                    <Space key={field_en.key} align="baseline" className="gap-cls">
                                                        <Row>

                                                            { index_en > 0 ?
                                                                <Divider orientation="left" orientationMargin={0} className="devider-color">{`Question & Answer ` + (index_en + 1)}
                                                                </Divider>
                                                            : null }

                                                            <Col span={24} sm={12}>
                                                                <Form.Item className="qty-cls"
                                                                    {...field_en}
                                                                    name={[field_en.name, 'question']}
                                                                    label="Question"
                                                                    rules={[{ required: true, message: 'Please enter question' }]}
                                                                    normalize={value => value.trimStart()}
                                                                >
                                                                    <Input autoComplete="off" placeholder={`Enter Question in ${longLang.en}`} />
                                                            
                                                                </Form.Item>
                                                            </Col>
                                                            <Col span={24} sm={12}>
                                                                <Form.Item className="qty-cls"
                                                                    {...field_en}
                                                                    name={[field_en.name, 'answer']}
                                                                    label="Answer"
                                                                    rules={[{ required: true, message: 'Please enter answer' }]}
                                                                    normalize={value => value.trimStart()}
                                                                >
                                                                    <Input autoComplete="off" placeholder={`Enter Answer in ${longLang.en}`} />
                                                            
                                                                </Form.Item>
                                                            </Col>

                                                            { index_en > 0 ?
                                                                <div className="minus-wrap" style={{marginTop:"13px"}}>
                                                                    <MinusCircleOutlined onClick={() => remove(field_en.name)} style={{borderRadius:"8px" }}/>
                                                                </div>
                                                            : null }
                                                            
                                                        </Row>
                                                    </Space>
                                                </div>
                                            ))}
                                            
                                            <Col span={4}>
                                                <Form.Item className="mt-2">
                                                    <Button onClick={() => add()} block icon={<PlusOutlined />}></Button>
                                                </Form.Item>
                                            </Col>
                                        </>
                                    )}
                                </Form.List>
                            </Col>

                            {/* End English Content */}


                            {/* Start Spanish Content */}

                            <Divider orientation="left" orientationMargin={15} className="devider-color">{longLang.es}</Divider>

                            <Col md={24}>
                                <Form.List name="es_faq" className="mt-2">
                                    {(fields1, { add, remove }, { form }) => (
                                        <>
                                            {fields1.map((field_es, index_es) => (
                                                <div key={field_es.key}>
                                                    <Space key={field_es.key} align="baseline" className="gap-cls">
                                                        <Row>

                                                            { index_es > 0 ?
                                                                <Divider orientation="left" orientationMargin={0} className="devider-color">{`Question & Answer ` + (index_es + 1)}
                                                                </Divider>
                                                            : null }

                                                            <Col span={24} sm={12}>
                                                                <Form.Item className="qty-cls"
                                                                    {...field_es}
                                                                    name={[field_es.name, 'question']}
                                                                    label="Question"
                                                                    rules={[{ required: true, message: 'Please enter question' }]}
                                                                    normalize={value => value.trimStart()}
                                                                >
                                                                    <Input autoComplete="off" placeholder={`Enter Question in ${longLang.es}`} />
                                                            
                                                                </Form.Item>
                                                            </Col>
                                                            <Col span={24} sm={12}>
                                                                <Form.Item className="qty-cls"
                                                                    {...field_es}
                                                                    name={[field_es.name, 'answer']}
                                                                    label="Answer"
                                                                    rules={[{ required: true, message: 'Please enter answer' }]}
                                                                    normalize={value => value.trimStart()}
                                                                >
                                                                    <Input autoComplete="off" placeholder={`Enter Answer in ${longLang.es}`} />
                                                            
                                                                </Form.Item>
                                                            </Col>

                                                            { index_es > 0 ?
                                                                <div className="minus-wrap" style={{marginTop:"13px"}}>
                                                                    <MinusCircleOutlined onClick={() => remove(field_es.name)} style={{borderRadius:"8px" }}/>
                                                                </div>
                                                            : null }
                                                            
                                                        </Row>
                                                    </Space>
                                                </div>
                                            ))}
                                            
                                            <Col span={4}>
                                                <Form.Item className="mt-2">
                                                    <Button onClick={() => add()} block icon={<PlusOutlined />}></Button>
                                                </Form.Item>
                                            </Col>
                                        </>
                                    )}
                                </Form.List>
                            </Col>

                            {/* End Spanish Content */}


                            {/* Start German Content */}

                            <Divider orientation="left" orientationMargin={15} className="devider-color">{longLang.de}</Divider>

                            <Col md={24}>
                                <Form.List name="de_faq" className="mt-2">
                                    {(fields2, { add, remove }, { form }) => (
                                        <>
                                            {fields2.map((field_de, index_de) => (
                                                <div key={field_de.key}>
                                                    <Space key={field_de.key} align="baseline" className="gap-cls">
                                                        <Row>

                                                            { index_de > 0 ?
                                                                <Divider orientation="left" orientationMargin={0} className="devider-color">{`Question & Answer ` + (index_de + 1)}
                                                                </Divider>
                                                            : null }

                                                            <Col span={24} sm={12}>
                                                                <Form.Item className="qty-cls"
                                                                    {...field_de}
                                                                    name={[field_de.name, 'question']}
                                                                    label="Question"
                                                                    rules={[{ required: true, message: 'Please enter question' }]}
                                                                    normalize={value => value.trimStart()}
                                                                >
                                                                    <Input autoComplete="off" placeholder={`Enter Question in ${longLang.de}`} />
                                                            
                                                                </Form.Item>
                                                            </Col>
                                                            <Col span={24} sm={12}>
                                                                <Form.Item className="qty-cls"
                                                                    {...field_de}
                                                                    name={[field_de.name, 'answer']}
                                                                    label="Answer"
                                                                    rules={[{ required: true, message: 'Please enter answer' }]}
                                                                    normalize={value => value.trimStart()}
                                                                >
                                                                    <Input autoComplete="off" placeholder={`Enter Answer in ${longLang.de}`} />
                                                            
                                                                </Form.Item>
                                                            </Col>

                                                            { index_de > 0 ?
                                                                <div className="minus-wrap" style={{marginTop:"13px"}}>
                                                                    <MinusCircleOutlined onClick={() => remove(field_de.name)} style={{borderRadius:"8px" }}/>
                                                                </div>
                                                            : null }
                                                            
                                                        </Row>
                                                    </Space>
                                                </div>
                                            ))}
                                            
                                            <Col span={4}>
                                                <Form.Item className="mt-2">
                                                    <Button onClick={() => add()} block icon={<PlusOutlined />}></Button>
                                                </Form.Item>
                                            </Col>
                                        </>
                                    )}
                                </Form.List>
                            </Col>

                            {/* End German Content */}


                            {/* Start French Content */}

                            <Divider orientation="left" orientationMargin={15} className="devider-color">{longLang.fr}</Divider>

                            <Col md={24}>
                                <Form.List name="fr_faq" className="mt-2">
                                    {(fields3, { add, remove }, { form }) => (
                                        <>
                                            {fields3.map((field_fr, index_fr) => (
                                                <div key={field_fr.key}>
                                                    <Space key={field_fr.key} align="baseline" className="gap-cls">
                                                        <Row>

                                                            { index_fr > 0 ?
                                                                <Divider orientation="left" orientationMargin={0} className="devider-color">{`Question & Answer ` + (index_fr + 1)}
                                                                </Divider>
                                                            : null }

                                                            <Col span={24} sm={12}>
                                                                <Form.Item className="qty-cls"
                                                                    {...field_fr}
                                                                    name={[field_fr.name, 'question']}
                                                                    label="Question"
                                                                    rules={[{ required: true, message: 'Please enter question' }]}
                                                                    normalize={value => value.trimStart()}
                                                                >
                                                                    <Input autoComplete="off" placeholder={`Enter Question in ${longLang.de}`} />
                                                            
                                                                </Form.Item>
                                                            </Col>
                                                            <Col span={24} sm={12}>
                                                                <Form.Item className="qty-cls"
                                                                    {...field_fr}
                                                                    name={[field_fr.name, 'answer']}
                                                                    label="Answer"
                                                                    rules={[{ required: true, message: 'Please enter answer' }]}
                                                                    normalize={value => value.trimStart()}
                                                                >
                                                                    <Input autoComplete="off" placeholder={`Enter Answer in ${longLang.de}`} />
                                                            
                                                                </Form.Item>
                                                            </Col>

                                                            { index_fr > 0 ?
                                                                <div className="minus-wrap" style={{marginTop:"13px"}}>
                                                                    <MinusCircleOutlined onClick={() => remove(field_fr.name)} style={{borderRadius:"8px" }}/>
                                                                </div>
                                                            : null }
                                                            
                                                        </Row>
                                                    </Space>
                                                </div>
                                            ))}
                                            
                                            <Col span={4}>
                                                <Form.Item className="mt-2">
                                                    <Button onClick={() => add()} block icon={<PlusOutlined />}></Button>
                                                </Form.Item>
                                            </Col>
                                        </>
                                    )}
                                </Form.List>
                            </Col>

                            {/* End French Content */}

                        </Row>
                    :
                        <Row gutter={[24, 0]}>

                            {/* Start English Content */}
                            <Divider orientation="left" orientationMargin={15} className="devider-color">{longLang.en}</Divider>
                            
                            <Col span={24} sm={12}>
                                <Form.Item label={`Name (${shortLang.en})`} name="name"
                                    rules={[
                                        { required: true, message: `Please enter the name in ${longLang.en}!` },
                                        { max: 100, message: "Name should not contain more then 100 characters!" },
                                        { min: 2, message: "Name should contain atleast 2 characters!" },
                                    ]}
                                    normalize={value => value.trimStart()}
                                >
                                    <Input autoComplete="off" placeholder={`Enter Name in ${longLang.en}`}/>
                                </Form.Item>
                            </Col>

                            <Col span={24}>
                                <Form.Item label={`Description (${shortLang.en})`} name="description" 
                                    rules={[
                                        { required: true, message: `Enter Description ${longLang.en}!` },
                                    ]}
                                >
                                    <DescriptionEditor value={editorValue} placeholder={`Enter Description in ${longLang.en}`} onChange={(data)=> handleEditorChange(data)} />
                                </Form.Item>
                            </Col>
                            {/* End English Content */}


                            {/* Start Spanish Content */}
                            <Divider orientation="left" orientationMargin={15} className="devider-color">{longLang.es}</Divider>

                            <Col span={24} sm={12}>
                                <Form.Item label={`Name (${shortLang.es})`} name="ar_name" 
                                    rules={[
                                        { required: true, message: `Please enter the name in ${longLang.es}!` },
                                        { max: 100, message: "Name should not contain more then 100 characters!" },
                                        { min: 2, message: "Name should contain atleast 2 characters!" },
                                    ]}
                                    normalize={value => value.trimStart()}
                                >
                                    <Input autoComplete="off" placeholder={`Enter Name in ${longLang.es}`}/>
                                </Form.Item>
                            </Col>

                            <Col span={24}>
                                <Form.Item label={`Description (${shortLang.es})`} name="es_description" rules={[
                                        { required: true, message: `Enter Description ${longLang.en}!` },
                                    ]}>
                                    <DescriptionEditor value={editorEsValue} placeholder={`Enter Description in ${longLang.es}`} onChange={(data)=> handleEditorEsChange(data)} />
                                </Form.Item>
                            </Col>
                            {/* End Spanish Content */}


                            {/* Start German Content */}

                            <Divider orientation="left" orientationMargin={15} className="devider-color">{longLang.de}</Divider>

                            <Col span={24} sm={12}>
                                <Form.Item label={`Name (${shortLang.de})`} name="de_name" 
                                    rules={[
                                        { required: true, message: `Please enter the name in ${longLang.de}!` },
                                        { max: 100, message: "Name should not contain more then 100 characters!" },
                                        { min: 2, message: "Name should contain atleast 2 characters!" },
                                    ]}
                                    normalize={value => value.trimStart()}
                                >
                                    <Input autoComplete="off" placeholder={`Enter Name in ${longLang.de}`}/>
                                </Form.Item>
                            </Col>

                            <Col span={24}>
                                <Form.Item label={`Description (${shortLang.de})`} name="de_description"  rules={[
                                        { required: true, message: `Enter Description ${longLang.en}!` },
                                    ]}
                                >
                                    <DescriptionEditor value={editorDeValue} placeholder={`Enter Description in ${longLang.de}`} onChange={(data)=> handleEditorDeChange(data)} />
                                </Form.Item>
                            </Col>
                            {/* End German Content */}


                            {/* Start French Content */}

                            <Divider orientation="left" orientationMargin={15} className="devider-color">{longLang.fr}</Divider>

                            <Col span={24} sm={12}>
                                <Form.Item label={`Name (${shortLang.fr})`} name="fr_name" 
                                    rules={[
                                        { required: true, message: `Please enter the name in ${longLang.fr}!` },
                                        { max: 100, message: "Name should not contain more then 100 characters!" },
                                        { min: 2, message: "Name should contain atleast 2 characters!" },
                                    ]}
                                    normalize={value => value.trimStart()}
                                >
                                    <Input autoComplete="off" placeholder={`Enter Name in ${longLang.fr}`}/>
                                </Form.Item>
                            </Col>

                            <Col span={24}>
                                <Form.Item label={`Description (${shortLang.fr})`} name="fr_description" 
                                    rules={[
                                        { required: true, message: `Enter Description ${longLang.en}!` },
                                    ]}
                                >
                                    <DescriptionEditor value={editorFrValue} placeholder={`Enter Description in ${longLang.fr}`} onChange={(data)=> handleEditorFrChange(data)} />
                                </Form.Item>
                            </Col>
                            {/* End French Content */}

                        </Row>
                    }

                    <Form.Item className="btn-row float-right mb-0">
                        <Link className="ant-btn ant-btn-primary" type="primary" to={`/${routeName}`}>Back</Link>
                        <Button type="primary" loading={loading} htmlType="submit">Submit</Button>
                    </Form.Item>
                </Form>
            }
        </Card>
    )
}
export default Edit;
