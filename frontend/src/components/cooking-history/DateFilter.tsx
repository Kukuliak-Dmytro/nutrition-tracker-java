import { DatePicker } from "../ui/DatePicker";
import { Button } from "../ui/button";

interface DateFilterProps {
   startDate: Date | undefined;
   endDate: Date | undefined;
   onStartDateChange: (date: Date) => void;
   onEndDateChange: (date: Date) => void;
   onClear: () => void;
}

export default function DateFilter({
   startDate,
   endDate,
   onStartDateChange,
   onEndDateChange,
   onClear,
}: DateFilterProps) {

    return (
        <div className="flex gap-4 items-center">
            <div>
                <DatePicker selected={startDate} onSelect={onStartDateChange} placeholder="Start date" />
            </div>
            <div>
                <DatePicker selected={endDate} onSelect={onEndDateChange} placeholder="End date" />
            </div>
            <div>
                <Button onClick={onClear}>Clear</Button>
            </div>
        </div>
    )
}