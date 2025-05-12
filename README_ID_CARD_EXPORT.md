# ID Card Export Script

This Python script connects to your Supabase database, fetches ID card data, downloads high-quality images, and creates an Excel file with all details including serial numbers as admission numbers.

## Features

- Connects to the same Supabase database as your web application
- Downloads high-quality images with proper naming (student_name_father_name or mother_name)
- Creates an Excel file with all ID card details
- Assigns sequential serial numbers starting from 115601 as admission numbers
- Supports filtering by class ID or search term
- Saves images in a separate folder for easy access

## Requirements

- Python 3.7 or higher
- Required Python packages (see requirements.txt)

## Installation

1. Make sure you have Python 3.7+ installed on your system.

2. Install the required dependencies:

```bash
pip install -r requirements.txt
```

3. Create a `.env` file in the same directory as the script with your Supabase credentials:

```
VITE_SUPABASE_URL=https://your-supabase-url.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
VITE_SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
```

## Usage

Basic usage:

```bash
python export_id_cards.py
```

This will:
- Connect to your Supabase database
- Fetch all ID cards
- Download images to the `./output/images` directory
- Create an Excel file in the `./output` directory
- Use serial numbers starting from 115601

### Command Line Options

You can customize the script behavior with these options:

```bash
python export_id_cards.py --output ./custom_output --start-serial 200000
```

Available options:

- `--output OUTPUT_DIR`: Directory to save the Excel file and images (default: ./output)
- `--start-serial START`: Starting serial number for admission numbers (default: 115601)
- `--class-id CLASS_ID`: Filter by class ID (optional)
- `--search SEARCH`: Search term for filtering (optional)

### Examples

Export ID cards for a specific class:

```bash
python export_id_cards.py --class-id 123e4567-e89b-12d3-a456-426614174000
```

Export ID cards matching a search term:

```bash
python export_id_cards.py --search "Kumar"
```

Export with custom serial number start:

```bash
python export_id_cards.py --start-serial 200000
```

## Output

The script creates:

1. An Excel file with the following columns:
   - Serial No.
   - Admission No. (starting from the specified serial number)
   - Student Photo (filename)
   - Student Name
   - Class
   - Date of Birth
   - Father Photo (filename)
   - Father Name
   - Father Mobile
   - Mother Photo (filename)
   - Mother Name
   - Mother Mobile
   - Address
   - Created Date

2. A directory of high-quality images with standardized naming:
   - `{serial_number}_{student_name}_student.jpg`
   - `{serial_number}_{student_name}_{father_name}_father.jpg`
   - `{serial_number}_{student_name}_{mother_name}_mother.jpg`

## Troubleshooting

If you encounter any issues:

1. **Connection errors**: Verify your Supabase credentials in the `.env` file.

2. **Missing images**: Check if the image URLs in the database are valid and accessible.

3. **Permission errors**: Ensure you have write permissions to the output directory.

4. **Dependencies issues**: Make sure all required packages are installed with the correct versions.

## License

This script is provided for your internal use only.
