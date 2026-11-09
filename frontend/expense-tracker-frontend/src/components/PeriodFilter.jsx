import React, { useContext } from "react";
import {
  LuCalendar,
  LuChevronLeft,
  LuChevronRight,
  LuFilter,
  LuRotateCcw,
} from "react-icons/lu";
import ThemeContext from "../context/ThemeContext";
import {
  getTodayString,
  getCurrentWeekString,
  getCurrentMonthString,
  getCurrentYearString,
  shiftPeriod,
  formatPeriodLabel,
} from "../utils/helper";

export default function PeriodFilter({
  periodType = "month",
  setPeriodType,
  periodValue,
  setPeriodValue,
  showAllTime = true,
  summaryBadge = null,
  className = "",
}) {
  const { isDark } = useContext(ThemeContext);

  const handleTypeChange = (newType) => {
    setPeriodType(newType);
    if (newType === "day" || newType === "date") {
      setPeriodValue(getTodayString());
    } else if (newType === "week") {
      setPeriodValue(getCurrentWeekString());
    } else if (newType === "month") {
      setPeriodValue(getCurrentMonthString());
    } else if (newType === "year") {
      setPeriodValue(getCurrentYearString());
    } else {
      setPeriodValue("");
    }
  };

  const handleShift = (delta) => {
    setPeriodValue((prev) => shiftPeriod(periodType, prev, delta));
  };

  const handleResetCurrent = () => {
    if (periodType === "day" || periodType === "date") {
      setPeriodValue(getTodayString());
    } else if (periodType === "week") {
      setPeriodValue(getCurrentWeekString());
    } else if (periodType === "month") {
      setPeriodValue(getCurrentMonthString());
    } else if (periodType === "year") {
      setPeriodValue(getCurrentYearString());
    }
  };

  const activeLabel = formatPeriodLabel(periodType, periodValue);

  return (
    <div
      className={`${isDark ? "card-dark" : "card"
        } flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 ${className}`}
    >
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-2">
          <span className="p-2 rounded-lg bg-green-600/15 text-green-500">
            <LuFilter size={18} />
          </span>
          <span
            className={`text-sm font-semibold ${isDark ? "text-white" : "text-gray-900"
              }`}
          >
            Filter By:
          </span>
        </div>

        {/* Tab pills */}
        <div
          className={`inline-flex rounded-xl p-1 border ${isDark
            ? "bg-gray-900 border-gray-800"
            : "bg-gray-100 border-gray-200"
            }`}
        >
          {[
            { id: "day", label: "Day" },
            { id: "week", label: "Week" },
            { id: "month", label: "Month" },
            { id: "year", label: "Year" },
            ...(showAllTime ? [{ id: "all", label: "All Time" }] : []),
          ].map((tab) => {
            const isActive =
              periodType === tab.id ||
              (tab.id === "day" && periodType === "date");
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleTypeChange(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${isActive
                  ? "bg-green-700 text-white shadow-sm"
                  : isDark
                    ? "text-gray-400 hover:text-white"
                    : "text-gray-600 hover:text-gray-900"
                  }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {activeLabel && periodType !== "all" && (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-green-700/15 text-green-900 border border-blue-500/30 flex items-center gap-1.5">
            <LuCalendar size={13} />
            {activeLabel}
          </span>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between lg:justify-end gap-3">
        {summaryBadge}

        {/* Date inputs & Prev/Next controls */}
        {periodType !== "all" && (
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => handleShift(-1)}
              title="Previous"
              className={`p-2 rounded-lg border cursor-pointer transition ${isDark
                ? "bg-gray-900 border-gray-700 text-gray-200 hover:bg-gray-800"
                : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
            >
              <LuChevronLeft size={16} />
            </button>

            {(periodType === "day" || periodType === "date") && (
              <input
                type="date"
                value={periodValue || getTodayString()}
                onChange={(e) => setPeriodValue(e.target.value)}
                className={`px-3 py-1.5 rounded-lg border text-xs font-medium outline-none cursor-pointer ${isDark
                  ? "bg-gray-900 border-gray-700 text-white"
                  : "bg-white border-gray-300 text-gray-800"
                  }`}
              />
            )}

            {periodType === "week" && (
              <input
                type="week"
                value={periodValue || getCurrentWeekString()}
                onChange={(e) => setPeriodValue(e.target.value)}
                className={`px-3 py-1.5 rounded-lg border text-xs font-medium outline-none cursor-pointer ${isDark
                  ? "bg-gray-900 border-gray-700 text-white"
                  : "bg-white border-gray-300 text-gray-800"
                  }`}
              />
            )}

            {periodType === "month" && (
              <input
                type="month"
                value={periodValue || getCurrentMonthString()}
                onChange={(e) => setPeriodValue(e.target.value)}
                className={`px-3 py-1.5 rounded-lg border text-xs font-medium outline-none cursor-pointer ${isDark
                  ? "bg-gray-900 border-gray-700 text-white"
                  : "bg-white border-gray-300 text-gray-800"
                  }`}
              />
            )}

            {periodType === "year" && (
              <select
                value={periodValue || getCurrentYearString()}
                onChange={(e) => setPeriodValue(e.target.value)}
                className={`px-3 py-1.5 rounded-lg border text-xs font-medium outline-none cursor-pointer ${isDark
                  ? "bg-gray-900 border-gray-700 text-white"
                  : "bg-white border-gray-300 text-gray-800"
                  }`}
              >
                {Array.from({ length: 7 }, (_, i) => {
                  const y = new Date().getFullYear() - 4 + i;
                  return (
                    <option key={y} value={String(y)}>
                      {y}
                    </option>
                  );
                })}
              </select>
            )}

            <button
              type="button"
              onClick={() => handleShift(1)}
              title="Next"
              className={`p-2 rounded-lg border cursor-pointer transition ${isDark
                ? "bg-gray-900 border-gray-700 text-gray-200 hover:bg-gray-800"
                : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
            >
              <LuChevronRight size={16} />
            </button>

            <button
              type="button"
              onClick={handleResetCurrent}
              title="Reset to current"
              className={`px-2.5 py-1.5 rounded-lg border text-xs font-medium cursor-pointer transition ${isDark
                ? "bg-gray-900 border-gray-700 text-gray-300 hover:text-white"
                : "bg-white border-gray-300 text-gray-600 hover:text-gray-900"
                }`}
            >
              Current
            </button>
          </div>
        )}

        {periodType !== "month" && (
          <button
            type="button"
            onClick={() => handleTypeChange("month")}
            title="Reset to default Month view"
            className={`p-2 rounded-lg border text-xs text-gray-400 hover:text-blue-500 cursor-pointer transition ${isDark
              ? "border-gray-800 hover:bg-gray-800"
              : "border-gray-200 hover:bg-gray-100"
              }`}
          >
            <LuRotateCcw size={15} />
          </button>
        )}
      </div>
    </div>
  );
}

