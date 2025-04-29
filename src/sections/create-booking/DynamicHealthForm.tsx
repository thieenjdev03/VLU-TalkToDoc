import { Button } from '@mui/material';

export default function DynamicHealthForm({ questions }: { questions: any[] }) {
  return (
    <div className="max-w-xl box-shadow-md rounded-md p-4 mt-10">
      <h2 className="text-xl font-bold">Câu hỏi sức khoẻ</h2>
      <form className="space-y-4">
        {questions.map((q, idx) => (
          <div key={idx}>
            <label htmlFor={q.key} className="block font-medium mb-1">
              {q.label}
            </label>
            {q.type === 'text' && <input type="text" className="w-full border p-2 rounded" />}
            {q.type === 'select' && (
              <select className="w-full border p-2 rounded">
                {q.options.map((opt: string, i: number) => (
                  <option key={i}>{opt}</option>
                ))}
              </select>
            )}
          </div>
        ))}
        <Button variant="contained" color="primary">
          Tiếp Tục
        </Button>
      </form>
    </div>
  );
}
