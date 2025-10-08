import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

const MarketBarChart = ({ data, onCompanyClick }) => {
  const svgRef = useRef();
  const containerRef = useRef();
  const [width, setWidth] = useState(800);

  useEffect(() => {
    if (!containerRef.current) return;
    const updateDimensions = () => {
      const containerWidth = containerRef.current.offsetWidth || 800;
      const newWidth = Math.max(800, Math.floor(containerWidth));
      setWidth(newWidth);
    };
    updateDimensions();
    const resizeObserver = new ResizeObserver(entries => {
      if (!entries || !entries.length) return;
      const { width: containerWidth } = entries[0].contentRect;
      const newWidth = Math.max(800, Math.floor(containerWidth));
      setWidth(newWidth);
    });
    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  useEffect(() => {
    if (!svgRef.current || !data) return;

    const validData = data && Array.isArray(data) && data.length > 0
      ? data.filter(d => d && d.company_name && typeof d.market_cap_usd === 'number')
      : [];

    if (validData.length === 0) {
      d3.select(svgRef.current).selectAll('*').remove();
      return;
    }
    
    const rowHeight = 60; 
    const margin = { top: 40, right: 40, bottom: 20, left: 50 };
    const innerHeight = validData.length * rowHeight;
    const svgHeight = innerHeight + margin.top + margin.bottom;
    const innerWidth = width - margin.left - margin.right;
    
    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', svgHeight)
      .attr('viewBox', `0 0 ${width} ${svgHeight}`);
      
    svg.selectAll('*').remove();
    
    const companyNames = validData.map(d => d.company_name);
    const maxMarketCap = d3.max(validData, d => d.market_cap_usd);
    const domainMax = maxMarketCap * 1.1;

    const xScale = d3.scaleLinear().domain([0, domainMax]).range([0, innerWidth]);
    const yScale = d3.scaleBand().domain(companyNames).range([0, innerHeight]).padding(0.25);

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);
    const xAxis = d3.axisTop(xScale).tickFormat(d => `$${d3.format('.2s')(d)}`).ticks(6);
    g.append('g').attr('class', 'x-axis').call(xAxis);
    g.selectAll('.grid-line').data(xScale.ticks(6)).join('line')
      .attr('class', 'grid-line').attr('x1', d => xScale(d)).attr('x2', d => xScale(d))
      .attr('y1', 0).attr('y2', innerHeight).attr('stroke', '#E5E7EB').attr('stroke-dasharray', '2,2');

    const bars = g.selectAll('.bar')
      .data(validData, d => d.company_name)
      .join(
        enter => {
          const enterGroups = enter
            .append('g')
            .attr('class', 'bar')
            .attr('transform', d => `translate(0, ${yScale(d.company_name)})`)
            .attr('opacity', 0)
            .style('cursor', onCompanyClick ? 'pointer' : 'default')
            .on('click', (event, d) => {
              if (typeof onCompanyClick === 'function') {
                onCompanyClick(d.company_name);
              }
            });
          enterGroups.append('rect').attr('x', 0).attr('y', 0).attr('width', 0).attr('height', yScale.bandwidth()).attr('fill', d => d.primary_hex || '#3B82F6').attr('rx', 6).attr('ry', 6);
          enterGroups.append('text').attr('class', 'rank-label').attr('x', -15).attr('y', yScale.bandwidth() / 2).attr('dy', '0.35em').attr('text-anchor', 'end').attr('font-size', '18px').attr('font-weight', '900').attr('fill', '#374151').text((d, i) => i + 1);
          enterGroups.append('text').attr('class', 'company-label').attr('x', 15).attr('y', yScale.bandwidth() / 2).attr('dy', '0.35em').attr('text-anchor', 'start').attr('font-size', '15px').attr('font-weight', 'bold').attr('fill', 'white').text(d => d.company_name);
          enterGroups.append('image').attr('class', 'company-logo').attr('href', d => d.logo_url || '').attr('x', d => xScale(d.market_cap_usd) - 45).attr('y', yScale.bandwidth() / 2 - 20).attr('width', 40).attr('height', 40);
          enterGroups.append('text').attr('class', 'market-cap-value').attr('x', d => xScale(d.market_cap_usd) + 15).attr('y', yScale.bandwidth() / 2).attr('dy', '0.35em').attr('font-size', '14px').attr('font-weight', '500').attr('fill', '#6B7280').text(d => d.market_cap_display);
          
          enterGroups.transition().duration(800).ease(d3.easeCubicInOut).attr('opacity', 1);
          enterGroups.selectAll('rect').transition().duration(800).ease(d3.easeCubicInOut).delay(300).attr('width', d => xScale(d.market_cap_usd));
          enterGroups.selectAll('.company-logo').transition().duration(800).ease(d3.easeCubicInOut).delay(300).attr('x', d => xScale(d.market_cap_usd) - 45);
          enterGroups.selectAll('.market-cap-value').transition().duration(800).ease(d3.easeCubicInOut).delay(300).attr('x', d => xScale(d.market_cap_usd) + 15);
          return enterGroups;
        },
        update => {
          update
            .transition()
            .duration(800)
            .ease(d3.easeCubicInOut)
            .attr('transform', d => `translate(0, ${yScale(d.company_name)})`);
          update
            .style('cursor', onCompanyClick ? 'pointer' : 'default')
            .on('click', (event, d) => {
              if (typeof onCompanyClick === 'function') {
                onCompanyClick(d.company_name);
              }
            });
          update.selectAll('rect').transition().duration(800).ease(d3.easeCubicInOut).attr('width', d => xScale(d.market_cap_usd)).attr('fill', d => d.primary_hex || '#3B82F6');
          update.selectAll('.rank-label').text((d) => validData.findIndex(item => item.company_name === d.company_name) + 1);
          update.selectAll('.company-label').text(d => d.company_name);
          update.selectAll('.company-logo').transition().duration(800).ease(d3.easeCubicInOut).attr('href', d => d.logo_url || '').attr('x', d => xScale(d.market_cap_usd) - 45);
          update.selectAll('.market-cap-value').transition().duration(800).ease(d3.easeCubicInOut).attr('x', d => xScale(d.market_cap_usd) + 15).text(d => d.market_cap_display);
          return update;
        },
        exit => exit.transition().duration(800).ease(d3.easeCubicInOut).attr('opacity', 0).remove()
      );
    
    // Ensure bars variable is referenced to avoid lint unused warnings in some setups
    void bars;

  }, [data, width]);

  return (
    <div ref={containerRef} className="w-full bg-white rounded-lg border border-gray-200 shadow-sm">
      <svg ref={svgRef} className="w-full" style={{ display: 'block' }} />
    </div>
  );
};

export default MarketBarChart;