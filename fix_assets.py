from PIL import Image
import os

def remove_white_bg(input_path, output_path, threshold=240):
    try:
        if not os.path.exists(input_path):
            print(f"File not found: {input_path}")
            return

        img = Image.open(input_path).convert("RGBA")
        datas = img.getdata()

        new_data = []
        for item in datas:
            # Check if pixel is white-ish (R,G,B > threshold)
            if item[0] > threshold and item[1] > threshold and item[2] > threshold:
                new_data.append((255, 255, 255, 0)) # Fully transparent
            else:
                new_data.append(item)

        img.putdata(new_data)
        img.save(output_path, "PNG")
        print(f"Processed {input_path} -> {output_path}")
        
    except Exception as e:
        print(f"Error processing {input_path}: {e}")

def main():
    assets_dir = os.path.join(os.getcwd(), 'kundali_app/assets')
    
    # Process Ganesha
    ganesha_in = os.path.join(assets_dir, 'cover_ganesha.png')
    # Overwrite
    remove_white_bg(ganesha_in, ganesha_in)
    
    # Process Text
    text_in = os.path.join(assets_dir, 'cover_hindi_text.png')
    remove_white_bg(text_in, text_in)

if __name__ == "__main__":
    main()
