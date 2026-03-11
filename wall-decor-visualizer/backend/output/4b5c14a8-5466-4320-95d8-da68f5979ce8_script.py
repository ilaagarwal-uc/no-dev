OUTPUT_PATH = '/tmp/4b5c14a8-5466-4320-95d8-da68f5979ce8.glb'

import bpy

def create_wall_skeleton():
    """
    Reconstructs the structural skeleton of the wall based on the provided image dimensions.
    Dimensions used (in feet):
    - Total Height: 9'
    - Opening Width (Left): 7'
    - Opening Height: 8'
    - Header Height (Above opening): 1' (9' - 8')
    - Right Wall Width: 7'6" (7.5')
    - Total Width: 14'6" (14.5')
    """
    
    # Clear existing objects in the scene
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete()

    # Define dimensions
    wall_thickness = 0.5  # Assumed standard thickness
    opening_width = 7.0
    opening_height = 8.0
    right_section_width = 7.5  # 7'6"
    total_height = 9.0
    header_height = 1.0
    
    # 1. Create the Right Wall Section
    # This is the solid part of the wall on the right side.
    # Dimensions: Width=7.5, Depth=0.5, Height=9.0
    # Location: X center = opening_width + (right_section_width / 2) = 7.0 + 3.75 = 10.75
    #           Z center = total_height / 2 = 4.5
    bpy.ops.mesh.primitive_cube_add(size=1, location=(10.75, 0, 4.5))
    right_wall = bpy.context.active_object
    right_wall.scale = (right_section_width, wall_thickness, total_height)
    right_wall.name = "Wall_Right_Section"

    # 2. Create the Top Header Section
    # This is the horizontal section above the door/AC opening.
    # Dimensions: Width=7.0, Depth=0.5, Height=1.0
    # Location: X center = opening_width / 2 = 3.5
    #           Z center = opening_height + (header_height / 2) = 8.0 + 0.5 = 8.5
    bpy.ops.mesh.primitive_cube_add(size=1, location=(3.5, 0, 8.5))
    top_header = bpy.context.active_object
    top_header.scale = (opening_width, wall_thickness, header_height)
    top_header.name = "Wall_Top_Header"

    # Join the parts into a single "Main Wall" object
    bpy.ops.object.select_all(action='DESELECT')
    right_wall.select_set(True)
    top_header.select_set(True)
    bpy.context.view_layer.objects.active = right_wall
    bpy.ops.object.join()
    right_wall.name = "Main_Wall_Skeleton"

    # Export the result to GLB format
    # use_selection=False ensures the entire scene (the reconstructed wall) is exported
    bpy.ops.export_scene.gltf(
        filepath='/tmp/4b5c14a8-5466-4320-95d8-da68f5979ce8.glb',
        export_format='GLB',
        use_selection=False
    )

# Execute the function directly
create_wall_skeleton()