import { Row, Col, Card, Button, Skeleton, Divider } from "antd";
import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import useRequest from "../../hooks/useRequest";
import { ShowToast, Severty } from "../../helper/toast";
import apiPath from "../../constants/apiPath";
import { Badge } from 'antd';
import moment from "moment";
import { shortLang, longLang } from "../../config/language";

function View() {

  const sectionName           =   "Content";
  const routeName             =   "content";

  const params                =   useParams();
  const { request }           =   useRequest();
  const [list, setList]       =   useState({});
  const [loading, setLoading] =   useState(false);

  const fetchData = (slug) => {
    request({
      url: apiPath.viewContent + "/" + slug,
      method: 'GET',
      onSuccess: (data) => {
        setLoading(false);
        setList(data.data);
      },
      onError: (error) => {
        ShowToast(error, Severty.ERROR)
      }
    })
  }

  useEffect(() => {
    setLoading(true)
    fetchData(params.slug)
  }, [])

  return (
    <>
      <Card title={sectionName + " Details"}>
        <Row gutter={16}>
          <Col span={12} xs={24} md={24}>

            {loading ? <Skeleton active /> : 
              <>
                {list && list.slug !== 'faq' ?
                    <div className="view-main-list">

                      {/* Start English */}
                      <Divider orientation="left" orientationMargin={0} className="devider-color">{longLang.en}</Divider>

                      <div className="view-inner-cls">
                        <h5>Name:</h5>
                        <h6 className="cap">{list.name ? list.name : '-'}</h6>
                      </div>

                      <div className="view-inner-cls">
                        <h5>Description:</h5>
                        <h6 className="cap">{list.description ? <p dangerouslySetInnerHTML={{__html: list.description}}></p>   : "-"}</h6>
                      </div>
                      {/* End English */}


                      {/* Start Spanish */}
                      <Divider orientation="left" orientationMargin={0} className="devider-color">{longLang.es}</Divider>

                      <div className="view-inner-cls">
                        <h5>Name:</h5>
                        <h6 className="cap">{list.ar_name ? list.ar_name : '-'}</h6>
                      </div>
                    
                      <div className="view-inner-cls">
                        <h5>Description:</h5>
                        <h6 className="cap">{list.es_description ? <p dangerouslySetInnerHTML={{__html: list.es_description}}></p>   : "-"}</h6>
                      </div>
                      {/* End Spanish */}


                      {/* Start German */}
                      <Divider orientation="left" orientationMargin={0} className="devider-color">{longLang.de}</Divider>

                      <div className="view-inner-cls">
                        <h5>Name:</h5>
                        <h6 className="cap">{list.de_name ? list.de_name : '-'}</h6>
                      </div>
                    
                      <div className="view-inner-cls">
                        <h5>Description:</h5>
                        <h6 className="cap">{list.de_description ? <p dangerouslySetInnerHTML={{__html: list.de_description}}></p>   : "-"}</h6>
                      </div>
                      {/* End German */}


                      {/* Start Franch */}
                      <Divider orientation="left" orientationMargin={0} className="devider-color">{longLang.fr}</Divider>

                      <div className="view-inner-cls">
                        <h5>Name:</h5>
                        <h6 className="cap">{list.fr_name ? list.fr_name : '-'}</h6>
                      </div>
                    
                      <div className="view-inner-cls">
                        <h5>Description:</h5>
                        <h6 className="cap">{list.fr_description ? <p dangerouslySetInnerHTML={{__html: list.fr_description}}></p>   : "-"}</h6>
                      </div>
                      {/* End Franch */}

                      <div className="view-inner-cls">
                        <h5>Status:</h5>
                        <h6>{list.is_active ? <Badge colorSuccess status="success" text="Active" /> : <Badge status="error" text="InActive" />}</h6>
                      </div>

                      <div className="view-inner-cls">
                        <h5>Created On:</h5>
                        <h6>{list.created_at ? moment(list.created_at).format('DD-MMM-YYYY') : '-'}</h6>
                      </div>

                      <div className="view-inner-cls float-right">
                        <Link className="ant-btn ant-btn-primary"  to={`/${routeName}/`}>Back</Link>
                      </div>

                    </div>
                :
                  <div className="view-main-list">

                    {/* Start English */}

                    <Divider orientation="left" orientationMargin={0} className="devider-color">{longLang.en}</Divider>

                    <div className="view-inner-cls">
                      <Row gutter={[24,0]}>
                        {list && list.faq && list.faq.map((item, index) => 
                          <Col className="mt-1" md={24}>
                            <Row gutter={[24,0]}>
                              <Col md={1}> <h5>Q.{(index + 1)}:</h5> </Col>
                              <Col md={23}> <h6 className="cap">{item.question ? item.question : '-'}</h6> </Col>
                            </Row>
                            <Row gutter={[24,0]}>
                              <Col md={1}> <h5>A.{(index + 1)}:</h5> </Col>
                              <Col md={23}> <h6 className="cap">{item.answer ? item.answer : '-'}</h6> </Col>
                            </Row>
                          </Col>
                        )}
                      </Row>
                    </div>

                    {/* End English */}


                    {/* Start Spanish */}
                    <Divider orientation="left" orientationMargin={0} className="devider-color">{longLang.es}</Divider>

                    <div className="view-inner-cls">
                      <Row gutter={[24,0]}>
                        {list && list.es_faq && list.es_faq.map((item, index) => 
                          <Col className="mt-1" md={24}>
                            <Row gutter={[24,0]}>
                              <Col md={1}> <h5>Q.{(index + 1)}:</h5> </Col>
                              <Col md={23}> <h6 className="cap">{item.question ? item.question : '-'}</h6> </Col>
                            </Row>
                            <Row gutter={[24,0]}>
                              <Col md={1}> <h5>A.{(index + 1)}:</h5> </Col>
                              <Col md={23}> <h6 className="cap">{item.answer ? item.answer : '-'}</h6> </Col>
                            </Row>
                          </Col>
                        )}
                      </Row>
                    </div>

                    {/* End Spanish */}


                    {/* Start German */}
                    <Divider orientation="left" orientationMargin={0} className="devider-color">{longLang.de}</Divider>

                    <div className="view-inner-cls">
                      <Row gutter={[24,0]}>
                        {list && list.de_faq && list.de_faq.map((item, index) => 
                          <Col className="mt-1" md={24}>
                            <Row gutter={[24,0]}>
                              <Col md={1}> <h5>Q.{(index + 1)}:</h5> </Col>
                              <Col md={23}> <h6 className="cap">{item.question ? item.question : '-'}</h6> </Col>
                            </Row>
                            <Row gutter={[24,0]}>
                              <Col md={1}> <h5>A.{(index + 1)}:</h5> </Col>
                              <Col md={23}> <h6 className="cap">{item.answer ? item.answer : '-'}</h6> </Col>
                            </Row>
                          </Col>
                        )}
                      </Row>
                    </div>
                  
                    {/* End German */}


                    {/* Start Franch */}
                    <Divider orientation="left" orientationMargin={0} className="devider-color">{longLang.fr}</Divider>

                    <div className="view-inner-cls">
                      <Row gutter={[24,0]}>
                        {list && list.fr_faq && list.fr_faq.map((item, index) => 
                          <Col className="mt-1" md={24}>
                            <Row gutter={[24,0]}>
                              <Col md={1}> <h5>Q.{(index + 1)}:</h5> </Col>
                              <Col md={23}> <h6 className="cap">{item.question ? item.question : '-'}</h6> </Col>
                            </Row>
                            <Row gutter={[24,0]}>
                              <Col md={1}> <h5>A.{(index + 1)}:</h5> </Col>
                              <Col md={23}> <h6 className="cap">{item.answer ? item.answer : '-'}</h6> </Col>
                            </Row>
                          </Col>
                        )}
                      </Row>
                    </div>
                  
                    {/* End Franch */}

                    <div className="view-inner-cls">
                      <h5>Status:</h5>
                      <h6>{list.is_active ? <Badge colorSuccess status="success" text="Active" /> : <Badge status="error" text="InActive" />}</h6>
                    </div>

                    <div className="view-inner-cls">
                      <h5>Created On:</h5>
                      <h6>{list.created_at ? moment(list.created_at).format('DD-MMM-YYYY') : '-'}</h6>
                    </div>

                    <div className="view-inner-cls float-right">
                      <Link className="ant-btn ant-btn-primary" to={`/${routeName}/`}>Back</Link>
                    </div>

                  </div>
                }
              </>
            }
            
          </Col>
        </Row>
      </Card>
    </>
  );
}

export default View;
