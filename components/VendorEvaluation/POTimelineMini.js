import React from 'react';
import moment from 'moment';

const TYPE_COLORS = {
  'po-date': 'bg-blue-500 border-blue-600',
  'planned-delivery': 'bg-green-500 border-green-600',
  'actual-delivery': 'bg-orange-500 border-orange-600',
  milestone: 'bg-purple-500 border-purple-600',
};

export default function POTimelineMini({ events = [] }) {
  if (!events.length) {
    return (
      <div className="text-sm text-gray-500 py-4 text-center border border-dashed border-gray-200 rounded-lg">
        No timeline events available for this PO.
      </div>
    );
  }

  const dates = events.map((e) => moment(e.date)).filter((d) => d.isValid());
  const minDate = moment.min(dates).clone().subtract(7, 'days');
  const maxDate = moment.max(dates).clone().add(7, 'days');
  const spanMs = Math.max(maxDate.valueOf() - minDate.valueOf(), 1);

  const position = (date) => {
    const m = moment(date);
    return ((m.valueOf() - minDate.valueOf()) / spanMs) * 100;
  };

  return (
    <div className="rounded-lg border border-indigo-100 bg-indigo-50/40 p-4">
      <h4 className="text-sm font-semibold text-indigo-800 mb-4">PO Timeline</h4>
      <div className="relative h-24 mb-2">
        <div className="absolute top-8 left-0 right-0 h-1 bg-gray-300 rounded-full" />
        {events.map((event, idx) => {
          const left = position(event.date);
          const color = TYPE_COLORS[event.type] || 'bg-gray-500 border-gray-600';
          return (
            <div
              key={`${event.label}-${idx}`}
              className="absolute top-5"
              style={{ left: `${left}%`, transform: 'translateX(-50%)' }}
            >
              <div className={`w-5 h-5 rounded-full border-2 ${color} relative group`}>
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-10 bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap shadow-lg">
                  <div className="font-semibold">{event.label}</div>
                  <div>{moment(event.date).format('DD MMM YYYY')}</div>
                </div>
              </div>
              <div className="text-[10px] text-gray-600 mt-2 text-center w-16 -ml-8 leading-tight">
                {moment(event.date).format('DD/MM')}
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex flex-wrap gap-3 text-xs text-gray-600">
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500" /> PO Date</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500" /> Planned</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-orange-500" /> Actual</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-purple-500" /> Milestone</span>
      </div>
    </div>
  );
}
