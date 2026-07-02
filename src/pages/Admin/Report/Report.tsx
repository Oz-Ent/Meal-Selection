import { NavBar } from '../../../components/NavBar/NavBar';
import { CalendarDays, ChevronDown, UserRoundCheck } from 'lucide-react';
import ListCard from '../../../components/ListCard/ListCard';
import { useState } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export function Report() {
  const report = {
    Monday: {
      total: 16,
      response: [
        {
          id: 1,
          food: 'indomie noodles fried egg and Sausages- chopped kpakpo shito',
          imageUrl: 'https://placehold.co/150x150/f3f4f6/a1a1aa?text=Bowl',
          count: 7,
          userInfo: [
            {
              id: '1',
              userName: 'John Doe',
              createdAt: '2023-08-01T10:00:00Z',
              createdBy: 'Admin',
            },
            {
              id: '2',
              userName: 'John Doe',
              createdAt: '2023-08-01T10:00:00Z',
              createdBy: 'Admin',
            },
            {
              id: '3',
              userName: 'John Doe',
              createdAt: '2023-08-01T10:00:00Z',
              createdBy: 'Admin',
            },
            {
              id: '4',
              userName: 'John Doe',
              createdAt: '2023-08-01T10:00:00Z',
              createdBy: 'Admin',
            },
            {
              id: '5',
              userName: 'John Doe',
              createdAt: '2023-08-01T10:00:00Z',
              createdBy: 'Admin',
            },
            {
              id: '6',
              userName: 'John Doe',
              createdAt: '2023-08-01T10:00:00Z',
              createdBy: 'Admin',
            },
            {
              id: '7',
              userName: 'John Doe',
              createdAt: '2023-08-01T10:00:00Z',
              createdBy: 'Admin',
            },
          ],
        },
        {
          id: 2,
          food: 'Vegetable Stir Fry',
          imageUrl: 'https://placehold.co/150x150/f3f4f6/a1a1aa?text=Bowl',
          count: 5,
          userInfo: [
            {
              id: '8',
              userName: 'John Doe',
              createdAt: '2023-08-01T10:00:00Z',
              createdBy: 'Admin',
            },
            {
              id: '9',
              userName: 'John Doe',
              createdAt: '2023-08-01T10:00:00Z',
              createdBy: 'Admin',
            },
            {
              id: '10',
              userName: 'John Doe',
              createdAt: '2023-08-01T10:00:00Z',
              createdBy: 'Admin',
            },
            {
              id: '11',
              userName: 'John Doe',
              createdAt: '2023-08-01T10:00:00Z',
              createdBy: 'Admin',
            },
            {
              id: '12',
              userName: 'John Doe',
              createdAt: '2023-08-01T10:00:00Z',
              createdBy: 'Admin',
            },
          ],
        },
        {
          id: 3,
          food: 'Vegetable Stir Fry',
          imageUrl: 'https://placehold.co/150x150/f3f4f6/a1a1aa?text=Bowl',
          count: 4,
          userInfo: [
            {
              id: '13',
              userName: 'John Doe',
              createdAt: '2023-08-01T10:00:00Z',
              createdBy: 'Admin',
            },
            {
              id: '14',
              userName: 'John Doe',
              createdAt: '2023-08-01T10:00:00Z',
              createdBy: 'Admin',
            },
            {
              id: '15',
              userName: 'John Doe',
              createdAt: '2023-08-01T10:00:00Z',
              createdBy: 'Admin',
            },
            {
              id: '16',
              userName: 'John Doe',
              createdAt: '2023-08-01T10:00:00Z',
              createdBy: 'Admin',
            },
          ],
        },
      ],
    },
    Tuesday: {
      total: 14,
      response: [
        {
          id: 4,
          food: 'Beef Teriyaki',
          imageUrl: 'https://placehold.co/150x150/f3f4f6/a1a1aa?text=Bowl',
          count: 7,
          userInfo: [
            {
              id: '17',
              userName: 'John Doe',
              createdAt: '2023-08-01T10:00:00Z',
              createdBy: 'Admin',
            },
            {
              id: '18',
              userName: 'John Doe',
              createdAt: '2023-08-01T10:00:00Z',
              createdBy: 'Admin',
            },
            {
              id: '19',
              userName: 'John Doe',
              createdAt: '2023-08-01T10:00:00Z',
              createdBy: 'Admin',
            },
            {
              id: '20',
              userName: 'John Doe',
              createdAt: '2023-08-01T10:00:00Z',
              createdBy: 'Admin',
            },
            {
              id: '21',
              userName: 'John Doe',
              createdAt: '2023-08-01T10:00:00Z',
              createdBy: 'Admin',
            },
          ],
        },
        {
          id: 5,
          food: 'Vegetable Stir Fry',
          imageUrl: 'https://placehold.co/150x150/f3f4f6/a1a1aa?text=Bowl',
          count: 5,
          userInfo: [
            {
              id: '22',
              userName: 'John Doe',
              createdAt: '2023-08-01T10:00:00Z',
              createdBy: 'Admin',
            },
            {
              id: '23',
              userName: 'John Doe',
              createdAt: '2023-08-01T10:00:00Z',
              createdBy: 'Admin',
            },
            {
              id: '24',
              userName: 'John Doe',
              createdAt: '2023-08-01T10:00:00Z',
              createdBy: 'Admin',
            },
            {
              id: '25',
              userName: 'John Doe',
              createdAt: '2023-08-01T10:00:00Z',
              createdBy: 'Admin',
            },
            {
              id: '26',
              userName: 'John Doe',
              createdAt: '2023-08-01T10:00:00Z',
              createdBy: 'Admin',
            },
          ],
        },
        {
          id: 6,
          food: 'Vegetable Stir Fry',
          imageUrl: 'https://placehold.co/150x150/f3f4f6/a1a1aa?text=Bowl',
          count: 4,
          userInfo: [
            {
              id: '27',
              userName: 'John Doe',
              createdAt: '2023-08-01T10:00:00Z',
              createdBy: 'Admin',
            },
            {
              id: '28',
              userName: 'John Doe',
              createdAt: '2023-08-01T10:00:00Z',
              createdBy: 'Admin',
            },
            {
              id: '29',
              userName: 'John Doe',
              createdAt: '2023-08-01T10:00:00Z',
              createdBy: 'Admin',
            },
            {
              id: '30',
              userName: 'John Doe',
              createdAt: '2023-08-01T10:00:00Z',
              createdBy: 'Admin',
            },
          ],
        },
      ],
    },
    Wednesday: {
      total: 12,
      response: [
        {
          id: 7,
          food: 'Beef Teriyaki',
          imageUrl: 'https://placehold.co/150x150/f3f4f6/a1a1aa?text=Bowl',
          count: 7,
          userInfo: [
            {
              id: '31',
              userName: 'John Doe',
              createdAt: '2023-08-01T10:00:00Z',
              createdBy: 'Admin',
            },
            {
              id: '32',
              userName: 'John Doe',
              createdAt: '2023-08-01T10:00:00Z',
              createdBy: 'Admin',
            },
            {
              id: '33',
              userName: 'John Doe',
              createdAt: '2023-08-01T10:00:00Z',
              createdBy: 'Admin',
            },
            {
              id: '34',
              userName: 'John Doe',
              createdAt: '2023-08-01T10:00:00Z',
              createdBy: 'Admin',
            },
            {
              id: '35',
              userName: 'John Doe',
              createdAt: '2023-08-01T10:00:00Z',
              createdBy: 'Admin',
            },
          ],
        },
        {
          id: 8,
          food: 'Vegetable Stir Fry',
          imageUrl: 'https://placehold.co/150x150/f3f4f6/a1a1aa?text=Bowl',
          count: 5,
          userInfo: [
            {
              id: '36',
              userName: 'John Doe',
              createdAt: '2023-08-01T10:00:00Z',
              createdBy: 'Admin',
            },
            {
              id: '37',
              userName: 'John Doe',
              createdAt: '2023-08-01T10:00:00Z',
              createdBy: 'Admin',
            },
            {
              id: '38',
              userName: 'John Doe',
              createdAt: '2023-08-01T10:00:00Z',
              createdBy: 'Admin',
            },
            {
              id: '39',
              userName: 'John Doe',
              createdAt: '2023-08-01T10:00:00Z',
              createdBy: 'Admin',
            },
            {
              id: '40',
              userName: 'John Doe',
              createdAt: '2023-08-01T10:00:00Z',
              createdBy: 'Admin',
            },
          ],
        },
        {
          id: 9,
          food: 'Vegetable Stir Fry',
          imageUrl: 'https://placehold.co/150x150/f3f4f6/a1a1aa?text=Bowl',
          count: 4,
          userInfo: [
            {
              id: '41',
              userName: 'John Doe',
              createdAt: '2023-08-01T10:00:00Z',
              createdBy: 'Admin',
            },
            {
              id: '42',
              userName: 'John Doe',
              createdAt: '2023-08-01T10:00:00Z',
              createdBy: 'Admin',
            },
            {
              id: '43',
              userName: 'John Doe',
              createdAt: '2023-08-01T10:00:00Z',
              createdBy: 'Admin',
            },
            {
              id: '44',
              userName: 'John Doe',
              createdAt: '2023-08-01T10:00:00Z',
              createdBy: 'Admin',
            },
          ],
        },
      ],
    },
    Thursday: {
      total: 12,
      response: [
        {
          id: 10,
          food: 'Beef Teriyaki',
          imageUrl: 'https://placehold.co/150x150/f3f4f6/a1a1aa?text=Bowl',
          count: 7,
          userInfo: [
            {
              id: '45',
              userName: 'John Doe',
              createdAt: '2023-08-01T10:00:00Z',
              createdBy: 'Admin',
            },
            {
              id: '46',
              userName: 'John Doe',
              createdAt: '2023-08-01T10:00:00Z',
              createdBy: 'Admin',
            },
            {
              id: '47',
              userName: 'John Doe',
              createdAt: '2023-08-01T10:00:00Z',
              createdBy: 'Admin',
            },
            {
              id: '48',
              userName: 'John Doe',
              createdAt: '2023-08-01T10:00:00Z',
              createdBy: 'Admin',
            },
            {
              id: '49',
              userName: 'John Doe',
              createdAt: '2023-08-01T10:00:00Z',
              createdBy: 'Admin',
            },
          ],
        },
        {
          id: 11,
          food: 'Vegetable Stir Fry',
          imageUrl: 'https://placehold.co/150x150/f3f4f6/a1a1aa?text=Bowl',
          count: 5,
          userInfo: [
            {
              id: '50',
              userName: 'John Doe',
              createdAt: '2023-08-01T10:00:00Z',
              createdBy: 'Admin',
            },
            {
              id: '51',
              userName: 'John Doe',
              createdAt: '2023-08-01T10:00:00Z',
              createdBy: 'Admin',
            },
            {
              id: '52',
              userName: 'John Doe',
              createdAt: '2023-08-01T10:00:00Z',
              createdBy: 'Admin',
            },
            {
              id: '53',
              userName: 'John Doe',
              createdAt: '2023-08-01T10:00:00Z',
              createdBy: 'Admin',
            },
            {
              id: '54',
              userName: 'John Doe',
              createdAt: '2023-08-01T10:00:00Z',
              createdBy: 'Admin',
            },
          ],
        },
        {
          id: 12,
          food: 'Vegetable Stir Fry',
          imageUrl: 'https://placehold.co/150x150/f3f4f6/a1a1aa?text=Bowl',
          count: 4,
          userInfo: [
            {
              id: '55',
              userName: 'John Doe',
              createdAt: '2023-08-01T10:00:00Z',
              createdBy: 'Admin',
            },
            {
              id: '56',
              userName: 'John Doe',
              createdAt: '2023-08-01T10:00:00Z',
              createdBy: 'Admin',
            },
            {
              id: '57',
              userName: 'John Doe',
              createdAt: '2023-08-01T10:00:00Z',
              createdBy: 'Admin',
            },
            {
              id: '58',
              userName: 'John Doe',
              createdAt: '2023-08-01T10:00:00Z',
              createdBy: 'Admin',
            },
          ],
        },
      ],
    },
    Friday: {
      total: 12,
      response: [
        {
          id: 13,
          food: 'Beef Teriyaki',
          imageUrl: 'https://placehold.co/150x150/f3f4f6/a1a1aa?text=Bowl',
          count: 7,
          userInfo: [
            {
              id: '59',
              userName: 'John Doe',
              createdAt: '2023-08-01T10:00:00Z',
              createdBy: 'Admin',
            },
            {
              id: '60',
              userName: 'John Doe',
              createdAt: '2023-08-01T10:00:00Z',
              createdBy: 'Admin',
            },
            {
              id: '61',
              userName: 'John Doe',
              createdAt: '2023-08-01T10:00:00Z',
              createdBy: 'Admin',
            },
            {
              id: '62',
              userName: 'John Doe',
              createdAt: '2023-08-01T10:00:00Z',
              createdBy: 'Admin',
            },
            {
              id: '63',
              userName: 'John Doe',
              createdAt: '2023-08-01T10:00:00Z',
              createdBy: 'Admin',
            },
          ],
        },
        {
          id: 14,
          food: 'Vegetable Stir Fry',
          imageUrl: 'https://placehold.co/150x150/f3f4f6/a1a1aa?text=Bowl',
          count: 5,
          userInfo: [
            {
              id: '64',
              userName: 'John Doe',
              createdAt: '2023-08-01T10:00:00Z',
              createdBy: 'Admin',
            },
            {
              id: '65',
              userName: 'John Doe',
              createdAt: '2023-08-01T10:00:00Z',
              createdBy: 'Admin',
            },
            {
              id: '66',
              userName: 'John Doe',
              createdAt: '2023-08-01T10:00:00Z',
              createdBy: 'Admin',
            },
            {
              id: '67',
              userName: 'John Doe',
              createdAt: '2023-08-01T10:00:00Z',
              createdBy: 'Admin',
            },
            {
              id: '68',
              userName: 'John Doe',
              createdAt: '2023-08-01T10:00:00Z',
              createdBy: 'Admin',
            },
          ],
        },
        {
          id: 15,
          food: 'Vegetable Stir Fry',
          imageUrl: 'https://placehold.co/150x150/f3f4f6/a1a1aa?text=Bowl',
          count: 4,
          userInfo: [
            {
              id: '69',
              userName: 'John Doe',
              createdAt: '2023-08-01T10:00:00Z',
              createdBy: 'Admin',
            },
            {
              id: '70',
              userName: 'John Doe',
              createdAt: '2023-08-01T10:00:00Z',
              createdBy: 'Admin',
            },
            {
              id: '71',
              userName: 'John Doe',
              createdAt: '2023-08-01T10:00:00Z',
              createdBy: 'Admin',
            },
            {
              id: '72',
              userName: 'John Doe',
              createdAt: '2023-08-01T10:00:00Z',
              createdBy: 'Admin',
            },
          ],
        },
      ],
    },
  };
  const [selectedValues, setSelectedValues] = useState<number[] | undefined>(undefined);
  const [selectedUser, setSelectedUser] = useState<string[] | undefined>(undefined);
  const handleSelectValue = (value: number) => {
    setSelectedValues((prev) => {
      if (!prev) {
        return [value];
      }
      if (prev.includes(value)) {
        return prev.filter((id) => id !== value);
      }
      return [...prev, value];
    });
  };
  const handleSelectUser = (id: string) => {
    setSelectedUser((prev) => {
      if (!prev) {
        return [id];
      }
      if (prev.includes(id)) {
        return prev.filter((userId) => userId !== id);
      }
      return [...prev, id];
    });
  };
  const filter = [
    {
      id: '1',
      label: 'All',
    },
    {
      id: '2',
      label: 'Monday',
    },
    {
      id: '3',
      label: 'Tuesday',
    },
    {
      id: '4',
      label: 'Wednesday',
    },
    {
      id: '5',
      label: 'Thursday',
    },
    {
      id: '6',
      label: 'Friday',
    },
  ];
  const [selectedDay, setSelectedDay] = useState('All');
  const [openFilter, setOpentFilter] = useState(false);
  const handleExportPDF = () => {
    // 1. Initialize a new PDF document (portrait, millimeters, A4 size)
    const doc = new jsPDF();

    // 2. Add a Title to the document
    doc.text(`Meal Selection Report - ${selectedDay}`, 14, 15);
    // 3. Prepare the table columns and rows
    const tableColumn = ['Day', 'Food Item', 'Total Selections'];
    const tableRows: string[][] = [];
    // 4. Iterate over the report data to format it for the table
    Object.entries(report).forEach(([day, data]) => {
      // Only include the day if it matches the current filter
      if (selectedDay === 'All' || selectedDay === day) {
        data.response.forEach((meal, index) => {
          const rowData = [
            index === 0 ? day : '', // Only show the day name on the first row
            meal.food,
            meal.count.toString(), // Convert number to string for the PDF text
          ];
          tableRows.push(rowData);
        });
      }
    });
    // 5. Generate the table on the PDF
    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 20, // Start drawing the table below the title
      theme: 'striped', // Gives the table a clean, readable striped look
      styles: { fontSize: 10 },
      // Optional: customize header color to match your app's theme (e.g., msDeepBlue)
      headStyles: { fillColor: [22, 45, 58] },
    });
    // 6. Save and download the PDF file
    doc.save(`Meal_Report_${selectedDay}.pdf`);
  };
  return (
    <>
      <NavBar title="Report" backUrl="/admin/activities" onExportClick={handleExportPDF} />
      <div
        className=" relative w-[90%] h-10 my-4 border border-gray-300 rounded-lg bg-white m-auto flex items-center"
        onClick={() => {
          setOpentFilter((prev) => !prev);
        }}
      >
        <CalendarDays className=" px-2.5 border-r border-gray-300 h-full w-10 bg-gray-100 text-[#7E8299] rounded-l-lg" />
        <span className="ml-2">{selectedDay}</span>
        <ChevronDown className="mr-2 ml-auto text-gray-600" />
        {openFilter && (
          <div className="absolute top-full right-0 w-[89%] my-1 border-gray-300 border bg-background rounded-md shadow-lg z-50 px-3">
            {filter.map((f) => {
              return (
                <div
                  key={f.id}
                  className="w-full py-1.5 text-base text-gray-700 border-b border-gray-200 last:border-b-0 cursor-pointer"
                  onClick={() => setSelectedDay(f.label)}
                >
                  {f.label}
                </div>
              );
            })}
          </div>
        )}
      </div>
      {Object.entries(report).map(([day, data]) => {
        return (
          (selectedDay === 'All' || selectedDay === day) && (
            <div key={day}>
              <div className="flex justify-between items-center px-4 py-2">
                <span className="font-semibold text-msBoldText">{day}</span>
                <span className="text-msCardSecondaryText text-xs">{`${data.total} responses`}</span>
              </div>
              {data.response.map((response, index) => (
                <div key={index}>
                  <div className="relative">
                    <ListCard
                      id={response.id}
                      title={response.food}
                      imageUrl={response.imageUrl}
                      inputType="expand"
                      selectedValue={selectedValues}
                      onChange={(id) => handleSelectValue(Number(id))}
                    />
                    <div className="absolute right-4 top-1/4 -translate-y-1/2 flex items-center gap-1 text-white text-xs bg-msSecondary px-1.5 py-0.5 rounded ml-auto">
                      {`${response.count} `}
                      <UserRoundCheck className="h-3.5 w-3.5" />
                    </div>
                  </div>
                  {selectedValues?.includes(response.id) && (
                    <div className="ml-15 text-base mt-1 text-msCardSecondaryText py-3">
                      {response.userInfo.map((user, idx) => (
                        <div key={idx}>
                          <div className="cursor-pointer" onClick={() => handleSelectUser(user.id)}>
                            {`${idx + 1}. ${user.userName}`}
                          </div>
                          {selectedUser && selectedUser.includes(user.id) && (
                            <div className="ml-4 text-xs text-gray-500 mt-1 mb-3">
                              <span>{user.createdAt}</span> - <span>{user.createdBy}</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )
        );
      })}
    </>
  );
}
