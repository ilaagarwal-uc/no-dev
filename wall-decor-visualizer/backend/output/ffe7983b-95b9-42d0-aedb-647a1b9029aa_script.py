OUTPUT_PATH = '/tmp/ffe7983b-95b9-42d0-aedb-647a1b9029aa.glb'

import bpy

def create_wall_skeleton():
    """
    Reconstructs the structural skeleton of the wall based on the provided image dimensions.
    Dimensions:
    - Total Height: 9'
    - Door Opening Width: 7'
    - Door Opening Height: 8'
    - Wall Section Width (Right of door): 7'6" (7.5')
    - Gap above door: 1'
    """
    
    # Clear existing objects in the scene
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete()

    # Conversion factor from feet to meters
    ft_to_m = 0.3048
    wall_thickness = 0.15  # Standard wall thickness (~6 inches)

    # Calculated dimensions in meters
    door_w = 7.0 * ft_to_m
    door_h = 8.0 * ft_to_m
    right_wall_w = 7.5 * ft_to_m
    total_h = 9.0 * ft_to_m
    top_gap_h = 1.0 * ft_to_m

    # 1. Create the Right Wall Section
    # Dimensions: 7.5' wide, 9' high
    # Position: Starts at X = 7'
    bpy.ops.mesh.primitive_cube_add(size=1)
    wall_right = bpy.context.active_object
    wall_right.name = "Wall_Right_Section"
    wall_right.scale = (right_wall_w, wall_thickness, total_h)
    # Center calculation: (Start_X + Width/2, Depth/2, Height/2)
    wall_right.location = (door_w + (right_wall_w / 2), wall_thickness / 2, total_h / 2)

    # 2. Create the Top Wall Section (Header above the door)
    # Dimensions: 7' wide, 1' high
    # Position: Starts at X = 0, Z = 8'
    bpy.ops.mesh.primitive_cube_add(size=1)
    wall_top = bpy.context.active_object
    wall_top.name = "Wall_Top_Header"
    wall_top.scale = (door_w, wall_thickness, top_gap_h)
    # Center calculation: (Width/2, Depth/2, Base_Height + Height/2)
    wall_top.location = (door_w / 2, wall_thickness / 2, door_h + (top_gap_h / 2))

    # Apply transformations to bake scales into the mesh data
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)

    # Export the reconstructed skeleton to GLB format
    # use_selection=False ensures all created objects are included
    bpy.ops.export_scene.gltf(
        filepath='/tmp/ffe7983b-95b9-42d0-aedb-647a1b9029aa.glb', 
        export_format='GLB', 
        use_selection=False
    )

# Execute the function directly as requested
create_wall_skeleton()