OUTPUT_PATH = '/tmp/71be2696-3b98-4309-94d3-a703b575246e.glb'

import bpy

def create_wall_skeleton():
    """
    Reconstructs the structural skeleton of the wall based on the provided image dimensions.
    Dimensions used (in feet):
    - Total Height: 9'
    - Opening Height (left): 8'
    - Header Height (above opening): 1'
    - Opening Width (left): 7'
    - Right Wall Section Width: 7'6" (7.5')
    - Total Width: 14.5'
    """
    
    # Clear existing objects in the scene
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete()

    # Define dimensions
    wall_thickness = 0.5  # Assumed standard wall thickness
    opening_width = 7.0
    opening_height = 8.0
    right_wall_width = 7.5
    total_height = 9.0
    header_height = 1.0  # 9' total - 8' opening

    # 1. Create the Header (Wall section above the door/AC opening)
    # The opening starts from the left (x=0).
    # Header width is 7', height is 1', positioned above the 8' opening.
    bpy.ops.mesh.primitive_cube_add(size=1)
    header = bpy.context.active_object
    header.name = "Wall_Header"
    header.scale = (opening_width, wall_thickness, header_height)
    # Location is the center of the object
    header.location = (opening_width / 2, wall_thickness / 2, opening_height + (header_height / 2))

    # 2. Create the Right Wall Section
    # This section is 7.5' wide and spans the full 9' height.
    # It starts where the opening ends (x=7').
    bpy.ops.mesh.primitive_cube_add(size=1)
    right_wall = bpy.context.active_object
    right_wall.name = "Wall_Right_Section"
    right_wall.scale = (right_wall_width, wall_thickness, total_height)
    # Location is the center: 7' (offset) + 3.75' (half width)
    right_wall.location = (opening_width + (right_wall_width / 2), wall_thickness / 2, total_height / 2)

    # Apply transformations to ensure geometry is baked at the correct scale
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)

    # Export the reconstructed skeleton to a GLB file
    # use_selection=False ensures all created wall parts are included
    bpy.ops.export_scene.gltf(
        filepath='/tmp/71be2696-3b98-4309-94d3-a703b575246e.glb', 
        export_format='GLB', 
        use_selection=False
    )

# Execute the function directly
create_wall_skeleton()