OUTPUT_PATH = '/tmp/85a26e93-f6b6-4ce9-afb9-ecfe03ed0bc5.glb'

import bpy
import os

def create_wall_skeleton():
    # Clear existing objects in the scene
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete()

    # Dimensions in feet (converted to meters for Blender standard: 1 ft = 0.3048 m)
    ft_to_m = 0.3048
    
    # Wall thickness (standard 6 inches)
    thickness = 0.5 * ft_to_m
    
    # 1. Right Wall Segment
    # Width: 7'6" (7.5 ft), Height: 9 ft
    rw_w = 7.5 * ft_to_m
    rw_h = 9.0 * ft_to_m
    rw_d = thickness
    
    bpy.ops.mesh.primitive_cube_add(size=1)
    right_wall = bpy.context.active_object
    right_wall.name = "Right_Wall_Segment"
    right_wall.scale = (rw_w, rw_d, rw_h)
    # Position: Opening is 7ft wide on the left. 
    # Center X = 7ft + (7.5ft / 2) = 10.75ft
    # Center Z = 9ft / 2 = 4.5ft
    right_wall.location = (10.75 * ft_to_m, 0, 4.5 * ft_to_m)
    
    # 2. Top Lintel Segment (Above the opening)
    # Width: 7 ft, Height: 1 ft
    lt_w = 7.0 * ft_to_m
    lt_h = 1.0 * ft_to_m
    lt_d = thickness
    
    bpy.ops.mesh.primitive_cube_add(size=1)
    lintel = bpy.context.active_object
    lintel.name = "Top_Lintel_Segment"
    lintel.scale = (lt_w, lt_d, lt_h)
    # Position: Opening is 7ft wide starting from x=0.
    # Center X = 7ft / 2 = 3.5ft
    # Center Z = 8ft (opening height) + 0.5ft (half of lintel height) = 8.5ft
    lintel.location = (3.5 * ft_to_m, 0, 8.5 * ft_to_m)

    # Apply transformations
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)

    # Export to GLB
    output_path = os.path.join(os.path.expanduser("~"), "wall_skeleton.glb")
    # For headless environments, we often just use a local relative path
    output_path = "wall_skeleton.glb"
    
    bpy.ops.export_scene.gltf(
        filepath=output_path,
        export_format='GLB',
        use_selection=False
    )

create_wall_skeleton()