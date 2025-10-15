import { Col, Skeleton } from "antd";
import React, { useEffect, useState } from "react";
import apiPath from "../../constants/apiPath";
import { useAppContext } from "../../context/AppContext";
import lang from "../../helper/langHelper";
import { Severty, ShowToast } from "../../helper/toast";
import useDebounce from "../../hooks/useDebounce";
import useRequest from "../../hooks/useRequest";
import { UserMonthlyChart } from "../../components/_MonthlyChart";

import SectionWrapper from "../../components/SectionWrapper";

const dummy = {
  labels: [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ],
  datasets: [
    {
      label: "Dataset 1",
      data: [
        null,
        null,
        null,
        null,
        null,
        16000,
        null,
        5000,
        null,
        null,
        null,
        null,
      ], // Starting from June
      borderColor: "#F3E008",
      tension: 0.1,
      spanGaps: true, // Add this option
    },
    {
      label: "Dataset 2",
      data: [
        null,
        null,
        null,
        null,
        null,
        7000,
        null,
        8000,
        null,
        null,
        null,
        null,
      ], // Starting from June
      borderColor: "#383B42",
      backgroundColor: "rgba(53, 162, 235, 0.5)",
      spanGaps: true, // Add this option
      // yAxisID: 'y1',
    },
  ],
};

const MonthlyChartSection = () => {
  const { country } = useAppContext();
  const { request } = useRequest();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [years, setYears] = useState([]);
  const [refresh, setRefresh] = useState(false);
  const [filter, setFilter] = useState({
    country_id: undefined,
    city_id: undefined,
    year: undefined,
    month: undefined,
  });

  useEffect(() => {
    setLoading(true);
    // getFilters();
  }, [refresh, filter, country.country_id]);

  const getFilters = () => {
    request({
      url: `${apiPath.dashboard}/sales/filters`,
      method: "GET",
      onSuccess: (res) => {
        if (res.status) {
          const { data, months, years } = res;
          setYears(years);
        }
      },
      onError: (error) => {
        ShowToast(error, Severty.ERROR);
      },
    });
  };

  const fetchData = () => {
    request({
      url: `${apiPath.dashboard}/graph?period=monthly${
        filter.year ? `&year=${filter.year}` : ``
      }`,
      method: "GET",
      onSuccess: ({ data, status }) => {
        setLoading(false);
        console.log(data, "monthly");
        if (status) {
          setData(data);
          // const arr = [0, 0, 0, 0, 0, 0];
          // data.map(({ interval, count }) => {
          //   const findIndex = lastSixWeeks.findIndex(
          //     ({ weekNumber }) => weekNumber == parseInt(interval)
          //   );
          //   if (findIndex != -1) {
          //     arr[findIndex] = count;
          //   } else {
          //     arr[findIndex] = 0;
          //   }
          // });
          // console.log(arr, "llll");
          // setData(arr);
        }
      },
      onError: (error) => {
        console.log(error);
        setLoading(false);
        ShowToast(error, Severty.ERROR);
      },
    });
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <>
   
    { loading ? [1, 2].map((item) => <Skeleton active key={item} />)
        :
        <>
      <Col xs={24} xl={12} lg={24} className="mb-24">
        <SectionWrapper
          cardHeading={lang("Number of Users")}
          extra={
            <>
              <div className="w-100 text-head_right_cont">
                <div className="role-wrap"></div>
              </div>
            </>
          }
        >
          <UserMonthlyChart data={data?.user || []} />
        </SectionWrapper>
      </Col>

      <Col xs={24} xl={12} lg={24} className="mb-24">
        <SectionWrapper
          cardHeading={lang("Number of Active Users")}
          extra={
            <>
              <div className="w-100 text-head_right_cont">
                <div className="role-wrap"></div>
              </div>
            </>
          }
        >
          <UserMonthlyChart data={data?.activeUser || []} />
        </SectionWrapper>
      </Col>
      <Col xs={24} xl={12} lg={24} className="mb-24">
        <SectionWrapper
          cardHeading={lang("Number of Service Provider")}
          extra={
            <>
              <div className="w-100 text-head_right_cont">
                <div className="role-wrap"></div>
              </div>
            </>
          }
        >
          <UserMonthlyChart data={data?.provider || []} />
        </SectionWrapper>
      </Col>
      <Col xs={24} xl={12} lg={24} className="mb-24">
        <SectionWrapper
          cardHeading={lang("Number of Categories")}
          extra={
            <>
              <div className="w-100 text-head_right_cont">
                <div className="role-wrap"></div>
              </div>
            </>
          }
        >
          <UserMonthlyChart data={data?.categories || []} />
        </SectionWrapper>
      </Col>
      <Col xs={24} xl={12} lg={24} className="mb-24">
        <SectionWrapper
          cardHeading={lang("Number of Created Events")}
          extra={
            <>
              <div className="w-100 text-head_right_cont">
                <div className="role-wrap"></div>
              </div>
            </>
          }
        >
          <UserMonthlyChart data={data?.events || []} />
        </SectionWrapper>
      </Col>
      <Col xs={24} xl={12} lg={24} className="mb-24">
        <SectionWrapper
          cardHeading={lang("Number of Services")}
          extra={
            <>
              <div className="w-100 text-head_right_cont">
                <div className="role-wrap"></div>
              </div>
            </>
          }
        >
          <UserMonthlyChart data={data?.services || []} />
        </SectionWrapper>
      </Col>
      <Col xs={24} xl={12} lg={24} className="mb-24">
        <SectionWrapper
          cardHeading={lang("Number of Quotation")}
          extra={
            <>
              <div className="w-100 text-head_right_cont">
                <div className="role-wrap"></div>
              </div>
            </>
          }
        >
          <UserMonthlyChart data={data?.quotation || []} />
        </SectionWrapper>
      </Col>
      <Col xs={24} xl={12} lg={24} className="mb-24">
        <SectionWrapper
          cardHeading={lang("Number of Pending Quotation")}
          extra={
            <>
              <div className="w-100 text-head_right_cont">
                <div className="role-wrap"></div>
              </div>
            </>
          }
        >
          <UserMonthlyChart data={data?.pendingQuotation || []} />
        </SectionWrapper>
      </Col>
      <Col xs={24} xl={12} lg={24} className="mb-24">
        <SectionWrapper
          cardHeading={lang("Number of Support Cases")}
          extra={
            <>
              <div className="w-100 text-head_right_cont">
                <div className="role-wrap"></div>
              </div>
            </>
          }
        >
          <UserMonthlyChart data={data?.supportCases || []} />
        </SectionWrapper>
      </Col>
      <Col xs={24} xl={12} lg={24} className="mb-24">
        <SectionWrapper
          cardHeading={lang("Account Manager Performance")}
          extra={
            <>
              <div className="w-100 text-head_right_cont">
                <div className="role-wrap"></div>
              </div>
            </>
          }
        >
          <UserMonthlyChart data={data?.accPerformance || []} />
        </SectionWrapper>
      </Col>
      <Col xs={24} xl={12} lg={24} className="mb-24">
        <SectionWrapper
          cardHeading={lang("Service providers OnBoardings")}
          extra={
            <>
              <div className="w-100 text-head_right_cont">
                <div className="role-wrap"></div>
              </div>
            </>
          }
        >
          <UserMonthlyChart data={data?.Onboardings || []} />
        </SectionWrapper>
      </Col>
      <Col xs={24} xl={12} lg={24} className="mb-24">
        <SectionWrapper
          cardHeading={lang("Number of Visitor's")}
          extra={
            <>
              <div className="w-100 text-head_right_cont">
                <div className="role-wrap"></div>
              </div>
            </>
          }
        >
          <UserMonthlyChart data={data?.visitors || []} />
        </SectionWrapper>
      </Col>
      </>
    }
    </>
  );
};

export default MonthlyChartSection;
