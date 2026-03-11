OUTPUT_PATH = '/tmp/87f14b3a-6381-4660-8c98-de37c367a051.glb'

import bpy

def create_wall_skeleton():
    """
    Reconstructs the structural skeleton of the wall based on the provided image dimensions.
    The wall consists of a doorway opening (7' wide, 8' high) and a solid wall section.
    Total dimensions: Width = 14'6" (14.5'), Height = 9'.
    """
    # Clear existing mesh objects in the scene
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete()

    # Conversion factor from feet to meters (Blender's default unit)
    ft_to_m = 0.3048
    wall_thickness = 0.15  # Standard wall thickness (approx. 6 inches)

    # DIMENSIONS DATA:
    # Total Wall Height: 9'
    # Doorway Width: 7'
    # Doorway Height: 8'
    # Wall segment to the right of doorway: 7'6" (7.5')
    # Wall segment above doorway: 1' height (9' total - 8' doorway)

    # 1. Create the Right Wall Segment
    # Dimensions: Width 7.5', Height 9'
    w_right_width = 7.5 * ft_to_m
    w_right_height = 9.0 * ft_to_m
    
    bpy.ops.mesh.primitive_cube_add(size=1)
    wall_right = bpy.context.active_object
    wall_right.name = "Wall_Right_Segment"
    wall_right.dimensions = (w_right_width, wall_thickness, w_right_height)
    
    # Positioning:
    # The doorway is on the left (0 to 7'). The right segment starts at 7'.
    # Center X = 7' + (7.5' / 2) = 10.75'
    # Center Z = 9' / 2 = 4.5'
    wall_right.location = (10.75 * ft_to_m, 0, 4.5 * ft_to_m)

    # 2. Create the Top Wall Segment (Header above the door)
    # Dimensions: Width 7', Height 1'
    w_top_width = 7.0 * ft_to_m
    w_top_height = 1.0 * ft_to_m
    
    bpy.ops.mesh.primitive_cube_add(size=1)
    wall_top = bpy.context.active_object
    wall_top.name = "Wall_Top_Segment"
    wall_top.dimensions = (w_top_width, wall_thickness, w_top_height)
    
    # Positioning:
    # Spans the doorway width (0 to 7').
    # Center X = 7' / 2 = 3.5'
    # Center Z = 8' (door height) + (1' / 2) = 8.5'
    wall_top.location = (3.5 * ft_to_m, 0, 8.5 * ft_to_m)

    # Export the reconstructed skeleton to GLB format
    # use_selection=False ensures all created objects are included in the export
    bpy.ops.export_scene.gltf(
        filepath='/tmp/87f14b3a-6381-4660-8c98-de37c367a051.glb', 
        export_format='GLB', 
        use_selection=False
    )

# Execute the function directly
create_wall_skeleton()